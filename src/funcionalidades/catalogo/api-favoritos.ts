import { clienteHttp } from '@/biblioteca/http'

export async function listarFavoritos(): Promise<string[]> {
  const { data } = await clienteHttp.get<{ nftIds: string[] }>('/favoritos')
  return data.nftIds
}

export async function adicionarFavorito(nftId: string): Promise<void> {
  await clienteHttp.post(`/favoritos/${nftId}`)
}

export async function removerFavorito(nftId: string): Promise<void> {
  await clienteHttp.delete(`/favoritos/${nftId}`)
}
