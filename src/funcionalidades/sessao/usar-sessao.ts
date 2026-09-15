import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { limparCachePrivado } from '@/aplicacao/cliente-consultas'
import { chaves } from '@/biblioteca/chaves-consulta'
import { mesclarCarrinhoDoVisitante } from '@/funcionalidades/carrinho/api-carrinho'
import {
  descartarIdentidadeAnonima,
  lerIdentidadeAnonima,
} from '@/funcionalidades/carrinho/identidade'
import { cadastrar, entrar, obterSessao, sair } from '@/funcionalidades/sessao/api-sessao'
import {
  estaAutenticado,
  limparToken,
  salvarToken,
} from '@/funcionalidades/sessao/sessao-local'
import { obterSocket } from '@/funcionalidades/tempo-real/socket'
import type { Sessao } from '@/tipos/dominio'

/**
 * Sessão atual. Só consulta quando existe token; revalida ao focar a
 * janela (staleTime 0), descobrindo expiração cedo. O 401 é tratado
 * globalmente pelo interceptor + Provedores.
 */
export function useSessao() {
  return useQuery({
    queryKey: chaves.sessao,
    queryFn: obterSessao,
    enabled: estaAutenticado(),
    staleTime: 0,
  })
}

/** Compartilhado por login e cadastro: ambos terminam com sessão nova. */
function aplicarSessaoNova(cliente: ReturnType<typeof useQueryClient>, sessao: Sessao) {
  // Troca de usuário: limpa o privado ANTES de gravar a sessão nova,
  // para que nada do usuário anterior vaze para o próximo.
  limparCachePrivado(cliente)
  salvarToken(sessao.token)
  cliente.setQueryData(chaves.sessao, sessao)
}

/** Após gravar a sessão nova, soma o carrinho do visitante ao do usuário. */
async function mesclarCarrinhoAposLogin(
  cliente: ReturnType<typeof useQueryClient>,
  sessao: Sessao,
) {
  const identidadeAnonima = lerIdentidadeAnonima()
  if (identidadeAnonima) {
    // O token novo já sai no interceptor; falha de mesclagem não bloqueia o login.
    await mesclarCarrinhoDoVisitante(identidadeAnonima).catch(() => undefined)
    descartarIdentidadeAnonima()
  }

  const identidadeUsuario = `usuario:${sessao.usuario.id}`
  await cliente.invalidateQueries({ queryKey: chaves.carrinho(identidadeUsuario) })
  await cliente.invalidateQueries({ queryKey: chaves.cotacoes(identidadeUsuario) })
}

export function useEntrar() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: entrar,
    onSuccess: async (sessao) => {
      aplicarSessaoNova(cliente, sessao)
      await mesclarCarrinhoAposLogin(cliente, sessao)
    },
  })
}

export function useCadastrar() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: cadastrar,
    onSuccess: async (sessao) => {
      aplicarSessaoNova(cliente, sessao)
      await mesclarCarrinhoAposLogin(cliente, sessao)
    },
  })
}

export function useSair() {
  const cliente = useQueryClient()
  const roteador = useRouter()

  return useMutation({
    mutationFn: sair,
    // onSettled: mesmo se o servidor falhar, a sessão local é encerrada.
    onSettled: () => {
      limparToken()
      limparCachePrivado(cliente)
      // Encerra as subscriptions da sessão anterior; o hook reconecta como visitante.
      obterSocket().disconnect()
      void roteador.navigate({ to: '/', search: {} as never })
    },
  })
}
