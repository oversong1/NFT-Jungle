import { clienteHttp } from '@/biblioteca/http'
import type { Carrinho, Cotacao } from '@/tipos/dominio'

export async function buscarCarrinho(sinal?: AbortSignal): Promise<Carrinho> {
  const { data } = await clienteHttp.get<Carrinho>('/carrinho', { signal: sinal })
  return data
}

/**
 * Define a quantidade de um item (cria ou substitui).
 * O handler valida quantidade e estoque e devolve o carrinho.
 */
export async function definirItemCarrinho(
  nftId: string,
  quantidade: number,
): Promise<Carrinho> {
  const { data } = await clienteHttp.put<Carrinho>(`/carrinho/itens/${nftId}`, {
    quantidade,
  })
  return data
}

export async function removerItemCarrinho(nftId: string): Promise<Carrinho> {
  const { data } = await clienteHttp.delete<Carrinho>(`/carrinho/itens/${nftId}`)
  return data
}

/**
 * Cotação calculada pelo servidor com Decimal: subtotal, desconto do cupom,
 * taxa de rede e total. Cupom inválido/expirado responde 422 CUPOM_INVALIDO.
 */
export async function obterCotacao(
  cupom: string | null,
  sinal?: AbortSignal,
): Promise<Cotacao> {
  const { data } = await clienteHttp.post<Cotacao>(
    '/cotacao',
    { cupom: cupom ?? undefined },
    { signal: sinal },
  )
  return data
}

/** Mescla o carrinho do visitante no carrinho do usuário recém-autenticado*/
export async function mesclarCarrinhoDoVisitante(
  identidadeAnonima: string,
): Promise<Carrinho> {
  const { data } = await clienteHttp.post<Carrinho>('/carrinho/mesclar', {
    identidadeAnonima,
  })
  return data
}
