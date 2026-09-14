import { clienteHttp } from '@/biblioteca/http'
import type { FiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'
import type { Paginacao } from '@/tipos/api'
import type { Nft } from '@/tipos/dominio'

export async function buscarNfts(
  filtros: FiltrosCatalogo,
  sinal?: AbortSignal,
): Promise<Paginacao<Nft>> {
  const { data } = await clienteHttp.get<Paginacao<Nft>>('/nfts', {
    params: filtros,
    signal: sinal,
  })
  return data
}

export async function buscarNftPorId(nftId: string, sinal?: AbortSignal): Promise<Nft> {
  const { data } = await clienteHttp.get<Nft>(`/nfts/${nftId}`, { signal: sinal })
  return data
}
