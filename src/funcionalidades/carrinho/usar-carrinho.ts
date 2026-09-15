import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { chaves } from '@/biblioteca/chaves-consulta'
import {
  buscarCarrinho,
  definirItemCarrinho,
  obterCotacao,
  removerItemCarrinho,
} from '@/funcionalidades/carrinho/api-carrinho'
import { identidadeDoCarrinho } from '@/funcionalidades/carrinho/identidade'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'

/** Identidade atual do carrinho: 'usuario:<id>' ou 'anonimo:<uuid>'. */
export function useIdentidadeCarrinho(): string {
  const sessao = useSessao()
  return identidadeDoCarrinho(sessao.data?.usuario.id)
}

export function useCarrinho() {
  const identidade = useIdentidadeCarrinho()

  return useQuery({
    queryKey: chaves.carrinho(identidade),
    queryFn: ({ signal }) => buscarCarrinho(signal),
    // Carrinho muda com frequência; melhor revalidar sempre que a tela abrir.
    staleTime: 0,
  })
}

/** Cotação do carrinho atual. 'habilitada' evita cotar carrinho vazio. */
export function useCotacao(cupom: string | null, habilitada: boolean) {
  const identidade = useIdentidadeCarrinho()

  return useQuery({
    queryKey: chaves.cotacao(identidade, cupom),
    queryFn: ({ signal }) => obterCotacao(cupom, signal),
    enabled: habilitada,
    staleTime: 0,
  })
}

/** Toda mutação de carrinho invalida carrinho E cotações juntos: um único padrão. */
function useInvalidarCarrinho() {
  const cliente = useQueryClient()
  const identidade = useIdentidadeCarrinho()

  return async () => {
    await Promise.all([
      cliente.invalidateQueries({ queryKey: chaves.carrinho(identidade) }),
      cliente.invalidateQueries({ queryKey: chaves.cotacoes(identidade) }),
    ])
  }
}

export function useDefinirItemCarrinho() {
  const invalidar = useInvalidarCarrinho()

  return useMutation({
    mutationFn: ({ nftId, quantidade }: { nftId: string; quantidade: number }) =>
      definirItemCarrinho(nftId, quantidade),
    // onSettled roda no sucesso E no erro: após um 409 de estoque,
    // a tela volta a mostrar o estado real do servidor.
    onSettled: invalidar,
  })
}

export function useRemoverItemCarrinho() {
  const invalidar = useInvalidarCarrinho()

  return useMutation({
    mutationFn: (nftId: string) => removerItemCarrinho(nftId),
    onSettled: invalidar,
  })
}
