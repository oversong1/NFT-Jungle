import { http, HttpResponse } from 'msw'

import { autenticar, erroApi } from '@/mocks/apoio'
import { obterBanco, salvarBanco } from '@/mocks/armazenamento'
import { iniciarRequisicao } from '@/mocks/cenarios'
import type { Carteira } from '@/tipos/dominio'

export const handlersConta = [
  // Perfil
  http.get('/api/perfil', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver o perfil.')

    return HttpResponse.json(usuario)
  }),

  http.patch('/api/perfil', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para editar o perfil.')

    const corpo = (await request.json()) as { nome?: string; avatarUrl?: string }
    const banco = obterBanco()
    const registro = banco.usuarios.find((item) => item.id === usuario.id)!

    if (corpo.nome !== undefined) {
      if (corpo.nome.trim().length < 2) {
        return erroApi(422, 'NOME_INVALIDO', 'Informe um nome válido.', {
          nome: 'Informe um nome com pelo menos 2 caracteres.',
        })
      }
      registro.nome = corpo.nome.trim()
    }
    if (corpo.avatarUrl !== undefined) registro.avatarUrl = corpo.avatarUrl
    salvarBanco()

    const { senha: _senha, ...publico } = registro
    return HttpResponse.json(publico)
  }),

  // Carteiras
  http.get('/api/carteiras', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver carteiras.')

    const banco = obterBanco()
    return HttpResponse.json(
      banco.carteiras.filter((carteira) => carteira.usuarioId === usuario.id),
    )
  }),

  http.post('/api/carteiras', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para criar carteira.')

    const corpo = (await request.json()) as Partial<
      Pick<Carteira, 'apelido' | 'endereco' | 'rede'>
    >

    if (!corpo.endereco || !/^0x[0-9a-fA-F]{40}$/.test(corpo.endereco)) {
      return erroApi(422, 'ENDERECO_INVALIDO', 'Endereço de carteira inválido.', {
        endereco: 'Use o formato 0x seguido de 40 caracteres hexadecimais.',
      })
    }

    const banco = obterBanco()
    const primeira = !banco.carteiras.some(
      (carteira) => carteira.usuarioId === usuario.id,
    )

    const nova: Carteira = {
      id: `car-${Date.now()}`,
      versao: 1,
      atualizadoEm: new Date().toISOString(),
      usuarioId: usuario.id,
      apelido: corpo.apelido?.trim() || 'Nova carteira',
      endereco: corpo.endereco,
      rede: corpo.rede ?? 'ethereum',
      principal: primeira,
    }
    banco.carteiras.push(nova)
    salvarBanco()

    return HttpResponse.json(nova, { status: 201 })
  }),

  http.delete('/api/carteiras/:carteiraId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para excluir carteira.')

    const banco = obterBanco()
    banco.carteiras = banco.carteiras.filter(
      (carteira) =>
        !(carteira.id === params.carteiraId && carteira.usuarioId === usuario.id),
    )
    salvarBanco()

    return new HttpResponse(null, { status: 204 })
  }),
]
