import Decimal from 'decimal.js'
import { http, HttpResponse } from 'msw'

import { esquemaFiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'
import { erroApi } from '@/mocks/apoio'
import { obterBanco } from '@/mocks/armazenamento'
import { iniciarRequisicao } from '@/mocks/cenarios'
import type { Paginacao } from '@/tipos/api'
import type { Nft } from '@/tipos/dominio'

const POR_PAGINA = 6

export const handlersCatalogo = [
  http.get('/api/nfts', async ({ request }) => {
    const { cenario, respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    // O mesmo esquema Zod da URL valida os parâmetros da API:
    // contrato único entre navegador e "servidor".
    const url = new URL(request.url)
    const filtros = esquemaFiltrosCatalogo.parse(Object.fromEntries(url.searchParams))

    if (cenario === 'vazio') {
      const vazio: Paginacao<Nft> = {
        itens: [],
        pagina: 1,
        porPagina: POR_PAGINA,
        total: 0,
        totalPaginas: 0,
      }
      return HttpResponse.json(vazio)
    }

    const banco = obterBanco()
    let resultado = [...banco.nfts]

    if (filtros.q) {
      const termo = filtros.q.toLowerCase()
      resultado = resultado.filter(
        (nft) =>
          nft.nome.toLowerCase().includes(termo) ||
          nft.colecaoNome.toLowerCase().includes(termo),
      )
    }
    if (filtros.categoria !== 'todas') {
      resultado = resultado.filter((nft) => nft.categoria === filtros.categoria)
    }
    if (filtros.rede !== 'todas') {
      resultado = resultado.filter((nft) => nft.rede === filtros.rede)
    }
    if (filtros.raridade !== 'todas') {
      resultado = resultado.filter((nft) => nft.raridade === filtros.raridade)
    }
    if (filtros.precoMin) {
      resultado = resultado.filter((nft) =>
        new Decimal(nft.precoEth).gte(filtros.precoMin!),
      )
    }
    if (filtros.precoMax) {
      resultado = resultado.filter((nft) =>
        new Decimal(nft.precoEth).lte(filtros.precoMax!),
      )
    }

    resultado.sort((a, b) => {
      switch (filtros.ordenacao) {
        case 'preco-crescente':
          return new Decimal(a.precoEth).comparedTo(b.precoEth)
        case 'preco-decrescente':
          return new Decimal(b.precoEth).comparedTo(a.precoEth)
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR')
        case 'recentes':
        default:
          return b.atualizadoEm.localeCompare(a.atualizadoEm)
      }
    })

    const total = resultado.length
    const totalPaginas = Math.ceil(total / POR_PAGINA)
    const pagina = Math.min(filtros.pagina, Math.max(totalPaginas, 1))
    const inicio = (pagina - 1) * POR_PAGINA

    const resposta: Paginacao<Nft> = {
      itens: resultado.slice(inicio, inicio + POR_PAGINA),
      pagina,
      porPagina: POR_PAGINA,
      total,
      totalPaginas,
    }
    return HttpResponse.json(resposta)
  }),

  http.get('/api/nfts/:nftId', async ({ params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const banco = obterBanco()
    const nft = banco.nfts.find((registro) => registro.id === params.nftId)

    if (!nft) {
      return erroApi(404, 'NFT_INEXISTENTE', 'Este NFT não existe no catálogo.')
    }
    return HttpResponse.json(nft)
  }),
]
