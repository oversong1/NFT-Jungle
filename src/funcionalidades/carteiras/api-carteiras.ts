import { clienteHttp } from '@/biblioteca/http'
import type { Carteira, RedeNft } from '@/tipos/dominio'

export type DadosCarteira = {
  apelido: string
  endereco: string
  rede: RedeNft
  principal: boolean
}

export async function listarCarteiras(sinal?: AbortSignal): Promise<Carteira[]> {
  const { data } = await clienteHttp.get<Carteira[]>('/carteiras', { signal: sinal })
  return data
}

export async function criarCarteira(dados: DadosCarteira): Promise<Carteira> {
  const { data } = await clienteHttp.post<Carteira>('/carteiras', dados)
  return data
}

export async function atualizarCarteira(
  carteiraId: string,
  dados: Partial<Pick<DadosCarteira, 'apelido' | 'rede' | 'principal'>>,
): Promise<Carteira> {
  const { data } = await clienteHttp.patch<Carteira>(`/carteiras/${carteiraId}`, dados)
  return data
}

export async function removerCarteira(carteiraId: string): Promise<void> {
  await clienteHttp.delete(`/carteiras/${carteiraId}`)
}
