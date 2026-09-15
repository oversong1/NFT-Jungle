import { clienteHttp } from '@/biblioteca/http'
import type { Pedido } from '@/tipos/dominio'

export type DadosCriacaoPedido = {
  cupom: string | null
  carteiraId: string
}

export async function criarPedido(
  dados: DadosCriacaoPedido,
  chaveIdempotencia: string,
): Promise<Pedido> {
  const { data } = await clienteHttp.post<Pedido>(
    '/pedidos',
    { cupom: dados.cupom ?? undefined, carteiraId: dados.carteiraId },
    { headers: { 'idempotency-key': chaveIdempotencia } },
  )
  return data
}

export async function buscarPedido(
  pedidoId: string,
  sinal?: AbortSignal,
): Promise<Pedido> {
  const { data } = await clienteHttp.get<Pedido>(`/pedidos/${pedidoId}`, {
    signal: sinal,
  })
  return data
}

export async function listarPedidos(sinal?: AbortSignal): Promise<Pedido[]> {
  const { data } = await clienteHttp.get<Pedido[]>('/pedidos', { signal: sinal })
  return data
}
