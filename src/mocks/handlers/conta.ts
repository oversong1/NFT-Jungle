import { http, HttpResponse } from 'msw'

import { autenticar, erroApi } from '@/mocks/apoio'
import { obterBanco, salvarBanco } from '@/mocks/armazenamento'
import { iniciarRequisicao } from '@/mocks/cenarios'
import type { Carteira } from '@/tipos/dominio'

export const handlersConta = [
  http.get('/api/perfil', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    return usuario
      ? HttpResponse.json(usuario)
      : erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver o perfil.')
  }),

  http.patch('/api/perfil', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para editar o perfil.')

    const corpo = (await request.json()) as { nome?: string; avatarUrl?: string }
    const registro = obterBanco().usuarios.find((item) => item.id === usuario.id)!
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

  http.post('/api/perfil/senha', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para alterar a senha.')

    const corpo = (await request.json()) as { senhaAtual?: string; novaSenha?: string }
    const registro = obterBanco().usuarios.find((item) => item.id === usuario.id)!
    if (!corpo.senhaAtual || registro.senha !== corpo.senhaAtual) {
      return erroApi(422, 'SENHA_ATUAL_INCORRETA', 'Não foi possível alterar a senha.', {
        senhaAtual: 'A senha atual está incorreta.',
      })
    }
    if (!corpo.novaSenha || corpo.novaSenha.length < 8) {
      return erroApi(
        422,
        'SENHA_FRACA',
        'A nova senha precisa de pelo menos 8 caracteres.',
        {
          novaSenha: 'Use pelo menos 8 caracteres.',
        },
      )
    }
    registro.senha = corpo.novaSenha
    salvarBanco()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/carteiras', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver carteiras.')
    return HttpResponse.json(
      obterBanco().carteiras.filter((item) => item.usuarioId === usuario.id),
    )
  }),

  http.post('/api/carteiras', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para criar carteira.')
    const corpo = (await request.json()) as Partial<
      Pick<Carteira, 'apelido' | 'endereco' | 'rede' | 'principal'>
    >
    if (!corpo.endereco || !/^0x[0-9a-fA-F]{40}$/.test(corpo.endereco)) {
      return erroApi(422, 'ENDERECO_INVALIDO', 'Endereço de carteira inválido.', {
        endereco: 'Use o formato 0x seguido de 40 caracteres hexadecimais.',
      })
    }

    const banco = obterBanco()
    const minhas = banco.carteiras.filter((item) => item.usuarioId === usuario.id)
    const principal = minhas.length === 0 || corpo.principal === true
    if (principal) {
      minhas.forEach((item) => {
        if (item.principal) {
          item.principal = false
          item.versao += 1
          item.atualizadoEm = new Date().toISOString()
        }
      })
    }
    const nova: Carteira = {
      id: `car-${Date.now()}`,
      versao: 1,
      atualizadoEm: new Date().toISOString(),
      usuarioId: usuario.id,
      apelido: corpo.apelido?.trim() || 'Nova carteira',
      endereco: corpo.endereco,
      rede: corpo.rede ?? 'ethereum',
      principal,
    }
    banco.carteiras.push(nova)
    salvarBanco()
    return HttpResponse.json(nova, { status: 201 })
  }),

  http.patch('/api/carteiras/:carteiraId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para editar carteira.')

    const banco = obterBanco()
    const carteira = banco.carteiras.find(
      (item) => item.id === params.carteiraId && item.usuarioId === usuario.id,
    )
    if (!carteira) return erroApi(404, 'CARTEIRA_INEXISTENTE', 'Carteira não encontrada.')
    const corpo = (await request.json()) as Partial<
      Pick<Carteira, 'apelido' | 'rede' | 'principal'>
    >
    if (corpo.principal === false && carteira.principal) {
      return erroApi(
        422,
        'PRINCIPAL_OBRIGATORIA',
        'Toda conta precisa de uma carteira principal.',
        {
          principal: 'Promova outra carteira antes de rebaixar esta.',
        },
      )
    }
    if (corpo.principal === true && !carteira.principal) {
      banco.carteiras
        .filter((item) => item.usuarioId === usuario.id && item.principal)
        .forEach((item) => {
          item.principal = false
          item.versao += 1
          item.atualizadoEm = new Date().toISOString()
        })
      carteira.principal = true
    }
    if (corpo.apelido !== undefined) {
      if (corpo.apelido.trim().length < 2) {
        return erroApi(422, 'APELIDO_INVALIDO', 'Informe um apelido válido.', {
          apelido: 'Use pelo menos 2 caracteres.',
        })
      }
      carteira.apelido = corpo.apelido.trim()
    }
    if (corpo.rede !== undefined) carteira.rede = corpo.rede
    carteira.versao += 1
    carteira.atualizadoEm = new Date().toISOString()
    salvarBanco()
    return HttpResponse.json(carteira)
  }),

  http.delete('/api/carteiras/:carteiraId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata
    const usuario = autenticar(request)
    if (!usuario)
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para excluir carteira.')

    const banco = obterBanco()
    const carteira = banco.carteiras.find(
      (item) => item.id === params.carteiraId && item.usuarioId === usuario.id,
    )
    if (!carteira) return erroApi(404, 'CARTEIRA_INEXISTENTE', 'Carteira não encontrada.')
    const possuiOutra = banco.carteiras.some(
      (item) => item.usuarioId === usuario.id && item.id !== carteira.id,
    )
    if (carteira.principal && possuiOutra) {
      return erroApi(
        409,
        'PRINCIPAL_PROTEGIDA',
        'Promova outra carteira a principal antes de excluir esta.',
      )
    }
    banco.carteiras = banco.carteiras.filter((item) => item.id !== carteira.id)
    salvarBanco()
    return new HttpResponse(null, { status: 204 })
  }),
]
