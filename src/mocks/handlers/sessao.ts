import { http, HttpResponse } from 'msw'

import { erroApi, autenticar } from '@/mocks/apoio'
import { obterBanco, salvarBanco } from '@/mocks/armazenamento'
import { iniciarRequisicao } from '@/mocks/cenarios'
import type { Sessao } from '@/tipos/dominio'

function criarSessao(usuarioId: string): Sessao {
  const banco = obterBanco()
  const token = `token-${usuarioId}-${Date.now()}`
  banco.sessoes[token] = usuarioId
  salvarBanco()

  const usuario = banco.usuarios.find((registro) => registro.id === usuarioId)!
  const { senha: _senha, ...publico } = usuario
  return { token, usuario: publico }
}

export const handlersSessao = [
  // Login
  http.post('/api/sessao', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const corpo = (await request.json()) as { email?: string; senha?: string }
    const banco = obterBanco()

    const usuario = banco.usuarios.find(
      (registro) =>
        registro.email === corpo.email?.toLowerCase().trim() &&
        registro.senha === corpo.senha,
    )

    if (!usuario) {
      return erroApi(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.')
    }

    return HttpResponse.json(criarSessao(usuario.id), { status: 201 })
  }),

  // Sessão atual (usada para recuperar login após F5)
  http.get('/api/sessao', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) {
      return erroApi(401, 'SESSAO_INVALIDA', 'Sessão inexistente ou expirada.')
    }

    const token = request.headers.get('authorization')!.slice('Bearer '.length)
    return HttpResponse.json({ token, usuario } satisfies Sessao)
  }),

  // Logout
  http.delete('/api/sessao', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const cabecalho = request.headers.get('authorization')
    if (cabecalho?.startsWith('Bearer ')) {
      const banco = obterBanco()
      delete banco.sessoes[cabecalho.slice('Bearer '.length)]
      salvarBanco()
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // Cadastro
  http.post('/api/conta', async ({ request }) => {
    const { cenario, respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const corpo = (await request.json()) as {
      nome?: string
      email?: string
      senha?: string
    }
    const banco = obterBanco()
    const email = corpo.email?.toLowerCase().trim() ?? ''

    const emailJaExiste = banco.usuarios.some((registro) => registro.email === email)

    if (emailJaExiste || cenario === 'conflito-cadastro') {
      return erroApi(409, 'EMAIL_JA_CADASTRADO', 'Este e-mail já possui conta.', {
        email: 'Este e-mail já possui conta.',
      })
    }

    if (!corpo.nome || !email || !corpo.senha) {
      return erroApi(422, 'DADOS_INCOMPLETOS', 'Preencha nome, e-mail e senha.')
    }

    const novoUsuario = {
      id: `usu-${banco.usuarios.length + 1}`,
      nome: corpo.nome,
      email,
      senha: corpo.senha,
      avatarUrl: null,
      criadoEm: new Date().toISOString(),
    }
    banco.usuarios.push(novoUsuario)
    salvarBanco()

    return HttpResponse.json(criarSessao(novoUsuario.id), { status: 201 })
  }),
]
