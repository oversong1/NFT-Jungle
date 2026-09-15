import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { chaves } from '@/biblioteca/chaves-consulta'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'

import {
  atualizarCarteira,
  criarCarteira,
  listarCarteiras,
  removerCarteira,
  type DadosCarteira,
} from './api-carteiras'

export function useCarteiras() {
  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  return useQuery({
    queryKey: chaves.carteiras(usuarioId ?? 'anonimo'),
    queryFn: ({ signal }) => listarCarteiras(signal),
    enabled: Boolean(usuarioId),
  })
}

/**
 * Invalidar, não editar o cache na mão: promover uma principal rebaixa outra,
 * e a lista inteira pode mudar. Refazer a consulta mostra exatamente o que o
 * banco decidiu — inclusive no seletor do checkout, que usa a mesma chave.
 */
function useInvalidarCarteiras() {
  const cliente = useQueryClient()
  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  return () =>
    cliente.invalidateQueries({ queryKey: chaves.carteiras(usuarioId ?? 'anonimo') })
}

export function useCriarCarteira() {
  const invalidar = useInvalidarCarteiras()
  return useMutation({ mutationFn: criarCarteira, onSettled: invalidar })
}

export function useAtualizarCarteira() {
  const invalidar = useInvalidarCarteiras()
  return useMutation({
    mutationFn: (entrada: {
      carteiraId: string
      dados: Partial<Pick<DadosCarteira, 'apelido' | 'rede' | 'principal'>>
    }) => atualizarCarteira(entrada.carteiraId, entrada.dados),
    onSettled: invalidar,
  })
}

export function useRemoverCarteira() {
  const invalidar = useInvalidarCarteiras()
  return useMutation({ mutationFn: removerCarteira, onSettled: invalidar })
}
