import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { chaves } from '@/biblioteca/chaves-consulta'
import { useIdentidadeCarrinho } from '@/funcionalidades/carrinho/usar-carrinho'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'
import type { Carrinho, Nft } from '@/tipos/dominio'

import {
  esquemaEventoNft,
  esquemaEventoPedido,
  EVENTO_NFT,
  EVENTO_PEDIDO,
} from './contratos'
import { obterSocket } from './socket'

/**
 * Sincroniza o cache da Query com os eventos do socket. As regras, na ordem:
 * validar o evento; comparar versão antes de escrever (duplicado ou antigo é
 * ignorado — nunca regride a tela); evento de pedido só interessa ao usuário
 * dono; o REST é a fonte de verdade na reconexão.
 *
 * O efeito depende de usuarioId e identidade de propósito: no login, logout
 * ou troca de usuário, os listeners antigos morrem na limpeza e listeners
 * novos nascem conhecendo a identidade nova — evento da sessão anterior
 * nunca atinge outro usuário.
 */
export function useTempoReal() {
  const cliente = useQueryClient()
  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id
  const identidade = useIdentidadeCarrinho()

  useEffect(() => {
    const socket = obterSocket()

    function aoNftAtualizado(bruto: unknown) {
      const resultado = esquemaEventoNft.safeParse(bruto)
      if (!resultado.success) {
        console.warn('Evento nft.updated malformado; descartado.', resultado.error)
        return
      }
      const evento = resultado.data
      const nftRecebido = evento.dados as unknown as Nft

      // Detalhe em cache: só escreve se o evento for mais novo.
      const emCache = cliente.getQueryData<Nft>(chaves.nft(evento.recursoId))
      if (emCache && emCache.versao >= evento.versao) {
        return // duplicado ou atrasado: nunca regride a tela
      }
      if (emCache) {
        cliente.setQueryData<Nft>(chaves.nft(evento.recursoId), nftRecebido)
      }

      // Listas do catálogo: invalidação por prefixo, sem cirurgia página a página.
      void cliente.invalidateQueries({ queryKey: ['catalogo'] })

      // Item no carrinho? Cotação e carrinho precisam de revisão.
      const carrinho = cliente.getQueryData<Carrinho>(chaves.carrinho(identidade))
      const estaNoCarrinho = carrinho?.itens.some(
        (item) => item.nftId === evento.recursoId,
      )
      if (estaNoCarrinho) {
        void cliente.invalidateQueries({ queryKey: chaves.carrinho(identidade) })
        void cliente.invalidateQueries({ queryKey: chaves.cotacoes(identidade) })
      }
    }

    function aoPedidoAtualizado(bruto: unknown) {
      const resultado = esquemaEventoPedido.safeParse(bruto)
      if (!resultado.success) {
        console.warn('Evento order.updated malformado; descartado.', resultado.error)
        return
      }
      const evento = resultado.data

      if (!usuarioId || evento.dados.usuarioId !== usuarioId) {
        return // evento de outro usuário nunca toca este cache
      }

      const chavePedido = chaves.pedido(usuarioId, evento.recursoId)
      const emCache = cliente.getQueryData<{ versao: number }>(chavePedido)
      if (emCache && emCache.versao >= evento.versao) return

      // O evento é um sinal; o REST é a fonte de verdade do estado completo.
      void cliente.invalidateQueries({ queryKey: chavePedido })
      void cliente.invalidateQueries({ queryKey: chaves.pedidos(usuarioId) })
    }

    function aoReconectar() {
      // O que chegou durante a queda vem pelo REST: reconciliação completa.
      void cliente.invalidateQueries({ queryKey: ['catalogo'] })
      void cliente.invalidateQueries({ queryKey: chaves.carrinho(identidade) })
      void cliente.invalidateQueries({ queryKey: chaves.cotacoes(identidade) })
      if (usuarioId) {
        void cliente.invalidateQueries({ queryKey: chaves.pedidos(usuarioId) })
      }
    }

    socket.on(EVENTO_NFT, aoNftAtualizado)
    socket.on(EVENTO_PEDIDO, aoPedidoAtualizado)
    socket.io.on('reconnect', aoReconectar)

    if (!socket.connected) socket.connect()

    return () => {
      socket.off(EVENTO_NFT, aoNftAtualizado)
      socket.off(EVENTO_PEDIDO, aoPedidoAtualizado)
      socket.io.off('reconnect', aoReconectar)
    }
  }, [cliente, usuarioId, identidade])
}
