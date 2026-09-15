import { http, HttpResponse } from 'msw'

import {
  autenticar,
  calcularCotacao,
  ehErroApi,
  erroApi,
  identidadeDaRequisicao,
  obterCarrinho,
} from '@/mocks/apoio'
import { obterBanco, salvarBanco } from '@/mocks/armazenamento'
import { iniciarRequisicao } from '@/mocks/cenarios'

function tocarCarrinho(identidade: string) {
  const carrinho = obterCarrinho(identidade)
  carrinho.versao += 1
  carrinho.atualizadoEm = new Date().toISOString()
  salvarBanco()
  return carrinho
}

export const handlersCarrinho = [
  http.get('/api/carrinho', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    return HttpResponse.json(obterCarrinho(identidadeDaRequisicao(request)))
  }),

  // Define a quantidade de um item (criar, aumentar, diminuir)
  http.put('/api/carrinho/itens/:nftId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const corpo = (await request.json()) as { quantidade?: number }
    const quantidade = corpo.quantidade

    if (!Number.isInteger(quantidade) || quantidade! < 1) {
      return erroApi(
        422,
        'QUANTIDADE_INVALIDA',
        'Quantidade deve ser inteiro positivo.',
        {
          quantidade: 'Quantidade deve ser inteiro positivo.',
        },
      )
    }

    const banco = obterBanco()
    const nftId = String(params.nftId)
    const nft = banco.nfts.find((registro) => registro.id === nftId)

    if (!nft) {
      return erroApi(404, 'NFT_INEXISTENTE', 'Este NFT não existe no catálogo.')
    }
    if (nft.edicao.disponiveis < quantidade!) {
      return erroApi(
        409,
        'EDICAO_ESGOTADA',
        'Não há unidades suficientes desta edição.',
        {
          quantidade: `Restam ${nft.edicao.disponiveis} unidades.`,
        },
      )
    }

    const identidade = identidadeDaRequisicao(request)
    const carrinho = obterCarrinho(identidade)
    const item = carrinho.itens.find((registro) => registro.nftId === nftId)

    if (item) item.quantidade = quantidade!
    else carrinho.itens.push({ nftId, quantidade: quantidade! })

    return HttpResponse.json(tocarCarrinho(identidade))
  }),

  http.delete('/api/carrinho/itens/:nftId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const identidade = identidadeDaRequisicao(request)
    const carrinho = obterCarrinho(identidade)
    carrinho.itens = carrinho.itens.filter((registro) => registro.nftId !== params.nftId)

    return HttpResponse.json(tocarCarrinho(identidade))
  }),

  // Cotação: subtotal, desconto de cupom, taxa de rede e total — tudo Decimal.
  http.post('/api/cotacao', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const corpo = (await request.json().catch(() => ({}))) as { cupom?: string }
    const carrinho = obterCarrinho(identidadeDaRequisicao(request))
    const cotacao = calcularCotacao(carrinho, corpo.cupom ?? null)

    if (ehErroApi(cotacao)) {
      return erroApi(cotacao.status, cotacao.codigo, cotacao.mensagem, cotacao.campos)
    }
    return HttpResponse.json(cotacao)
  }),

  // Mescla o carrinho de visitante no carrinho do usuário após o login.
  http.post('/api/carrinho/mesclar', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) {
      return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para mesclar o carrinho.')
    }

    const corpo = (await request.json().catch(() => ({}))) as {
      identidadeAnonima?: string
    }

    const identidadeUsuario = `usuario:${usuario.id}`
    const destino = obterCarrinho(identidadeUsuario)
    const banco = obterBanco()

    const chaveVisitante = corpo.identidadeAnonima
      ? `anonimo:${corpo.identidadeAnonima}`
      : null
    const origem = chaveVisitante ? banco.carrinhos[chaveVisitante] : undefined

    if (chaveVisitante && origem) {
      for (const item of origem.itens) {
        const nft = banco.nfts.find((registro) => registro.id === item.nftId)
        if (!nft) continue

        const existente = destino.itens.find((registro) => registro.nftId === item.nftId)
        // Quantidades se somam, limitadas pelo estoque disponível.
        const quantidade = Math.min(
          (existente?.quantidade ?? 0) + item.quantidade,
          nft.edicao.disponiveis,
        )
        if (quantidade < 1) continue

        if (existente) existente.quantidade = quantidade
        else destino.itens.push({ nftId: item.nftId, quantidade })
      }
      // O carrinho de visitante deixa de existir após a mesclagem.
      delete banco.carrinhos[chaveVisitante]
    }

    return HttpResponse.json(tocarCarrinho(identidadeUsuario))
  }),
]
