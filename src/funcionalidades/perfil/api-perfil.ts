import { clienteHttp } from '@/biblioteca/http'
import type { Usuario } from '@/tipos/dominio'

export async function obterPerfil(sinal?: AbortSignal): Promise<Usuario> {
  const { data } = await clienteHttp.get<Usuario>('/perfil', { signal: sinal })
  return data
}

export async function atualizarPerfil(dados: {
  nome?: string
  avatarUrl?: string
}): Promise<Usuario> {
  const { data } = await clienteHttp.patch<Usuario>('/perfil', dados)
  return data
}

export async function trocarSenha(dados: {
  senhaAtual: string
  novaSenha: string
}): Promise<void> {
  await clienteHttp.post('/perfil/senha', dados)
}
