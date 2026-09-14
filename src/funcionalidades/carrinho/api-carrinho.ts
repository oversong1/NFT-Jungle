import { clienteHttp } from '@/biblioteca/http'
import type { Carrinho } from '@/tipos/dominio'

/**
 * Define a quantidade de um item do carrinho (cria ou substitui).
 * O handler da Fase 5 valida quantidade e estoque e devolve o carrinho.
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
