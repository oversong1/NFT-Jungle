import { useQuery } from '@tanstack/react-query'

import { chaves } from '@/biblioteca/chaves-consulta'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'

import { buscarPedido } from './api-pedidos'

/**
 * Um pedido específico. Enquanto está 'processando', consulta a cada 2 s
 * como rede de segurança; o caminho principal é o evento order.updated
 *, que invalida esta mesma chave. Os dois convergem no REST.
 */
export function usePedido(pedidoId: string) {
  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  return useQuery({
    queryKey: chaves.pedido(usuarioId ?? 'anonimo', pedidoId),
    queryFn: ({ signal }) => buscarPedido(pedidoId, signal),
    enabled: Boolean(usuarioId),
    refetchInterval: (consulta) =>
      consulta.state.data?.status === 'processando' ? 2000 : false,
  })
}
