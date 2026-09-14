import { clienteHttp } from '@/biblioteca/http'
import type { Sessao } from '@/tipos/dominio'

import type { DadosCadastro, DadosEntrar } from '@/funcionalidades/sessao/esquemas'

export async function entrar(dados: DadosEntrar): Promise<Sessao> {
  const { data } = await clienteHttp.post<Sessao>('/sessao', dados)
  return data
}

export async function cadastrar(dados: DadosCadastro): Promise<Sessao> {
  const { data } = await clienteHttp.post<Sessao>('/conta', {
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
  })
  return data
}

export async function sair(): Promise<void> {
  await clienteHttp.delete('/sessao')
}

export async function obterSessao(): Promise<Sessao> {
  const { data } = await clienteHttp.get<Sessao>('/sessao')
  return data
}
