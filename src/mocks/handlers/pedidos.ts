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
import { iniciarRequisicao, type Cenario } from '@/mocks/cenarios'
import { servidorEventos } from '@/mocks/eventos'
import type { Pedido } from '@/tipos/dominio'

/** Transição assíncrona: simula o processamento do pagamento. */
function agendarDesfecho(pedidoId: string, cenario: Cenario) {
  const prazo = cenario === 'pedido-atrasado' ? 8000 : 2500
  const statusFinal = cenario === 'pedido-recusado' ? 'recusado' : 'aprovado'

  setTimeout(() => {
    const banco = obterBanco()
    const pedido = banco.pedidos.find((registro) => registro.id === pedidoId)
    if (!pedido || pedido.status !== 'processando') return

    pedido.status = statusFinal
    pedido.versao += 1
    pedido.atualizadoEm = new Date().toISOString()
    salvarBanco()
    servidorEventos.emitir('pedido:atualizado', pedido)
  }, prazo)
}

export const handlersPedidos = [
  http.post('/api/pedidos', async ({ request }) => {
    const { cenario, respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para comprar.')

    const banco = obterBanco()
    const identidade = identidadeDaRequisicao(request)
    const carrinho = obterCarrinho(identidade)

    if (carrinho.itens.length === 0) {
      return erroApi(422, 'CARRINHO_VAZIO', 'Adicione itens antes de finalizar.')
    }

    // Cenários de conflito no fechamento da compra
    if (cenario === 'preco-alterado') {
      const nft = banco.nfts.find((r) => r.id === carrinho.itens[0].nftId)!
      nft.versao += 1
      nft.atualizadoEm = new Date().toISOString()
      salvarBanco()
      servidorEventos.emitir('nft:atualizado', nft)
      return erroApi(
        409,
        'PRECO_ALTERADO',
        'O preço de um item mudou. Revise o carrinho.',
      )
    }
    if (cenario === 'edicao-esgotada') {
      return erroApi(409, 'EDICAO_ESGOTADA', 'Um item esgotou antes da confirmação.')
    }

    for (const item of carrinho.itens) {
      const nft = banco.nfts.find((registro) => registro.id === item.nftId)
      if (!nft || nft.edicao.disponiveis < item.quantidade) {
        return erroApi(409, 'EDICAO_ESGOTADA', 'Um item esgotou antes da confirmação.')
      }
    }

    const corpo = (await request.json().catch(() => ({}))) as { cupom?: string }
    const cotacao = calcularCotacao(carrinho, corpo.cupom ?? null)
    if (ehErroApi(cotacao)) {
      return erroApi(cotacao.status, cotacao.codigo, cotacao.mensagem, cotacao.campos)
    }

    // Baixa de estoque + snapshot do recibo no mesmo instante.
    const agora = new Date().toISOString()
    const itensRecibo = carrinho.itens.map((item) => {
      const nft = banco.nfts.find((registro) => registro.id === item.nftId)!
      nft.edicao.disponiveis -= item.quantidade
      nft.versao += 1
      nft.atualizadoEm = agora
      return {
        nftId: nft.id,
        nome: nft.nome,
        quantidade: item.quantidade,
        precoUnitarioEth: nft.precoEth,
      }
    })

    const pedido: Pedido = {
      id: `ped-${Date.now()}`,
      versao: 1,
      atualizadoEm: agora,
      usuarioId: usuario.id,
      status: 'processando',
      criadoEm: agora,
      recibo: { ...cotacao, itens: itensRecibo },
    }
    banco.pedidos.push(pedido)
    carrinho.itens = []
    carrinho.versao += 1
    carrinho.atualizadoEm = agora
    salvarBanco()

    agendarDesfecho(pedido.id, cenario)
    return HttpResponse.json(pedido, { status: 201 })
  }),

  http.get('/api/pedidos', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver pedidos.')

    const banco = obterBanco()
    const pedidos = banco.pedidos.filter((pedido) => pedido.usuarioId === usuario.id)
    return HttpResponse.json(pedidos)
  }),

  http.get('/api/pedidos/:pedidoId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver pedidos.')

    const banco = obterBanco()
    const pedido = banco.pedidos.find(
      (registro) => registro.id === params.pedidoId && registro.usuarioId === usuario.id,
    )

    if (!pedido) return erroApi(404, 'PEDIDO_INEXISTENTE', 'Pedido não encontrado.')
    return HttpResponse.json(pedido)
  }),
]
