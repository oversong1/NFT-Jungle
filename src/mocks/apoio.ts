import Decimal from 'decimal.js'
import { HttpResponse } from 'msw'

import { obterBanco, salvarBanco } from '@/mocks/armazenamento'
import { obterCenario } from '@/mocks/cenarios'
import { cuponsIniciais } from '@/mocks/dados/fixtures'
import type { ErroApi } from '@/tipos/api'
import type { Carrinho, Cotacao, Usuario } from '@/tipos/dominio'

/** Resposta de erro no formato ErroApi, o único que o Axios normalizará. */
export function erroApi(
  status: number,
  codigo: string,
  mensagem: string,
  campos?: Record<string, string>,
) {
  const corpo: ErroApi = { status, codigo, mensagem, campos }
  return HttpResponse.json(corpo, { status })
}

/** Resolve o usuário do cabeçalho Authorization: Bearer <token>. */
export function autenticar(request: Request): Usuario | null {
  // No cenário de sessão expirada, todo endpoint privado responde 401.
  if (obterCenario() === 'sessao-expirada') return null

  const cabecalho = request.headers.get('authorization')
  if (!cabecalho?.startsWith('Bearer ')) return null

  const token = cabecalho.slice('Bearer '.length)
  const banco = obterBanco()
  const usuarioId = banco.sessoes[token]
  if (!usuarioId) return null

  const usuario = banco.usuarios.find((registro) => registro.id === usuarioId)
  if (!usuario) return null

  const { senha: _senha, ...publico } = usuario
  return publico
}

/**
 * Identidade do carrinho: usuário logado ou visitante anônimo
 * (cabeçalho x-identidade-anonima, gerado pelo cliente).
 */
export function identidadeDaRequisicao(request: Request): string {
  const usuario = autenticar(request)
  if (usuario) return `usuario:${usuario.id}`

  const anonimo = request.headers.get('x-identidade-anonima')
  return anonimo ? `anonimo:${anonimo}` : 'anonimo:padrao'
}

export function obterCarrinho(identidade: string): Carrinho {
  const banco = obterBanco()

  if (!banco.carrinhos[identidade]) {
    banco.carrinhos[identidade] = {
      id: `carrinho:${identidade}`,
      versao: 1,
      atualizadoEm: new Date().toISOString(),
      identidade,
      itens: [],
    }
    salvarBanco()
  }

  return banco.carrinhos[identidade]
}

const TAXA_REDE_ETH = '0.0025'

/**
 * Único ponto de cálculo de valores. Usado pela cotação e pela criação
 * de pedido, garantindo que o recibo seja snapshot do mesmo cálculo.
 * Regra de ouro do desafio: Decimal para calcular, string para transportar.
 */
export function calcularCotacao(
  carrinho: Carrinho,
  cupomCodigo: string | null,
): Cotacao | ErroApi {
  const banco = obterBanco()

  let subtotal = new Decimal(0)
  for (const item of carrinho.itens) {
    const nft = banco.nfts.find((registro) => registro.id === item.nftId)
    if (!nft) {
      return {
        status: 422,
        codigo: 'ITEM_INEXISTENTE',
        mensagem: `O NFT ${item.nftId} não existe mais no catálogo.`,
      }
    }
    subtotal = subtotal.plus(new Decimal(nft.precoEth).mul(item.quantidade))
  }

  let desconto = new Decimal(0)
  let cupomAplicado: string | null = null

  if (cupomCodigo) {
    const cupom = cuponsValidos().find(
      (registro) => registro.codigo === cupomCodigo.toUpperCase(),
    )
    if (!cupom) {
      return {
        status: 422,
        codigo: 'CUPOM_INVALIDO',
        mensagem: 'Cupom inexistente, expirado ou desativado.',
        campos: { cupom: 'Cupom inexistente, expirado ou desativado.' },
      }
    }
    desconto = subtotal.mul(cupom.percentual).div(100).toDecimalPlaces(6)
    cupomAplicado = cupom.codigo
  }

  const taxaRede = new Decimal(TAXA_REDE_ETH)
  const total = subtotal.minus(desconto).plus(taxaRede)

  return {
    subtotalEth: subtotal.toFixed(6),
    descontoEth: desconto.toFixed(6),
    taxaRedeEth: taxaRede.toFixed(6),
    totalEth: total.toFixed(6),
    cupomAplicado,
  }
}

export function ehErroApi(valor: unknown): valor is ErroApi {
  return typeof valor === 'object' && valor !== null && 'codigo' in valor
}

function cuponsValidos() {
  const agora = new Date().toISOString()
  return cuponsIniciais.filter((cupom) => cupom.ativo && cupom.expiraEm > agora)
}
