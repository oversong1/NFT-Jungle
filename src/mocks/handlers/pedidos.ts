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

/** Conteúdo que a chave de idempotência protege: itens + cupom + carteira. */
function hashDaCompra(
  itens: Array<{ nftId: string; quantidade: number }>,
  cupom: string | null,
  carteiraId: string | null,
): string {
  const ordenados = [...itens]
    .map((item) => ({ nftId: item.nftId, quantidade: item.quantidade }))
    .sort((a, b) => a.nftId.localeCompare(b.nftId))
  return JSON.stringify({ itens: ordenados, cupom, carteiraId })
}

/**
 * Desfecho assíncrono do pagamento. Regras do enunciado:
 * aprovado baixa o estoque e remove do carrinho SOMENTE o que foi comprado;
 * recusado preserva carrinho e estoque intactos.
 */
function agendarDesfecho(pedidoId: string, identidade: string, cenario: Cenario) {
  const prazo = cenario === 'pedido-atrasado' ? 8000 : 2500

  setTimeout(() => {
    const banco = obterBanco()
    const pedido = banco.pedidos.find((registro) => registro.id === pedidoId)
    // Pedidos aprovados ou recusados são terminais: nunca mudam de novo.
    if (!pedido || pedido.status !== 'processando') return

    const agora = new Date().toISOString()

    if (cenario === 'pedido-recusado') {
      pedido.status = 'recusado'
    } else {
      const carrinho = obterCarrinho(identidade)
      // Revalidação final: se algo esgotou durante o processamento, recusa.
      const estoqueInsuficiente = pedido.recibo.itens.some((item) => {
        const nft = banco.nfts.find((registro) => registro.id === item.nftId)
        return !nft || nft.edicao.disponiveis < item.quantidade
      })

      if (estoqueInsuficiente) {
        pedido.status = 'recusado'
      } else {
        pedido.status = 'aprovado'
        for (const item of pedido.recibo.itens) {
          const nft = banco.nfts.find((registro) => registro.id === item.nftId)!
          // Baixa de estoque na APROVAÇÃO, guiada pelo recibo (snapshot).
          nft.edicao.disponiveis -= item.quantidade
          nft.versao += 1
          nft.atualizadoEm = agora
          servidorEventos.emitir('nft:atualizado', nft)

          // Remove do carrinho apenas a quantidade comprada.
          const noCarrinho = carrinho.itens.find(
            (registro) => registro.nftId === item.nftId,
          )
          if (noCarrinho) {
            noCarrinho.quantidade -= item.quantidade
            if (noCarrinho.quantidade <= 0) {
              carrinho.itens = carrinho.itens.filter(
                (registro) => registro.nftId !== item.nftId,
              )
            }
          }
        }
        carrinho.versao += 1
        carrinho.atualizadoEm = agora
      }
    }

    pedido.versao += 1
    pedido.atualizadoEm = agora
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

    // Idempotência: sem chave não há proteção contra duplicidade — recusa.
    const chave = request.headers.get('idempotency-key')
    if (!chave) {
      return erroApi(422, 'CHAVE_AUSENTE', 'Chave de idempotência obrigatória.')
    }

    const corpo = (await request.json().catch(() => ({}))) as {
      cupom?: string
      carteiraId?: string
    }

    const banco = obterBanco()
    const identidade = identidadeDaRequisicao(request)
    const carrinho = obterCarrinho(identidade)
    const hash = hashDaCompra(
      carrinho.itens,
      corpo.cupom ?? null,
      corpo.carteiraId ?? null,
    )

    const registro = banco.idempotencia[chave]
    if (registro) {
      if (registro.hash !== hash) {
        return erroApi(
          409,
          'CHAVE_REUTILIZADA',
          'Esta chave de idempotência já foi usada com um conteúdo diferente.',
        )
      }
      // Mesma chave + mesmo conteúdo: devolve o MESMO pedido, sem criar outro.
      const existente = banco.pedidos.find(
        (candidato) => candidato.id === registro.pedidoId,
      )
      if (existente) return HttpResponse.json(existente)
    }

    if (carrinho.itens.length === 0) {
      return erroApi(422, 'CARRINHO_VAZIO', 'Adicione itens antes de finalizar.')
    }
    if (!corpo.carteiraId) {
      return erroApi(422, 'CARTEIRA_AUSENTE', 'Escolha uma carteira para pagar.', {
        carteiraId: 'Escolha uma carteira.',
      })
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

    const cotacao = calcularCotacao(carrinho, corpo.cupom ?? null)
    if (ehErroApi(cotacao)) {
      return erroApi(cotacao.status, cotacao.codigo, cotacao.mensagem, cotacao.campos)
    }

    // Snapshot do recibo com os preços DESTE instante. Estoque e carrinho
    // não são tocados aqui: isso é papel exclusivo da aprovação.
    const agora = new Date().toISOString()
    const itensRecibo = carrinho.itens.map((item) => {
      const nft = banco.nfts.find((registro) => registro.id === item.nftId)!
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
      carteiraId: corpo.carteiraId,
      status: 'processando',
      criadoEm: agora,
      recibo: { ...cotacao, itens: itensRecibo },
    }
    banco.pedidos.push(pedido)
    banco.idempotencia[chave] = { pedidoId: pedido.id, hash }
    salvarBanco()

    agendarDesfecho(pedido.id, identidade, cenario)

    // Cenário determinístico do enunciado: o pedido NASCEU, mas a resposta
    // se perde (como um timeout). O cliente recupera reenviando a mesma chave.
    if (cenario === 'timeout-pos-criacao') {
      return HttpResponse.error()
    }

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
