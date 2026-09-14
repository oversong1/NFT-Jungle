import { http, HttpResponse } from 'msw'

import { autenticar, erroApi } from '@/mocks/apoio'
import { obterBanco, salvarBanco } from '@/mocks/armazenamento'
import { iniciarRequisicao } from '@/mocks/cenarios'

export const handlersFavoritos = [
  http.get('/api/favoritos', async ({ request }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para ver favoritos.')

    const banco = obterBanco()
    const nftIds = banco.favoritos
      .filter((favorito) => favorito.usuarioId === usuario.id)
      .map((favorito) => favorito.nftId)

    return HttpResponse.json({ nftIds })
  }),

  http.post('/api/favoritos/:nftId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para favoritar.')

    const banco = obterBanco()
    const nftId = String(params.nftId)

    if (!banco.nfts.some((nft) => nft.id === nftId)) {
      return erroApi(404, 'NFT_INEXISTENTE', 'Este NFT não existe no catálogo.')
    }

    const jaExiste = banco.favoritos.some(
      (favorito) => favorito.usuarioId === usuario.id && favorito.nftId === nftId,
    )
    if (!jaExiste) {
      banco.favoritos.push({
        usuarioId: usuario.id,
        nftId,
        criadoEm: new Date().toISOString(),
      })
      salvarBanco()
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('/api/favoritos/:nftId', async ({ request, params }) => {
    const { respostaImediata } = await iniciarRequisicao()
    if (respostaImediata) return respostaImediata

    const usuario = autenticar(request)
    if (!usuario) return erroApi(401, 'SESSAO_INVALIDA', 'Faça login para favoritar.')

    const banco = obterBanco()
    banco.favoritos = banco.favoritos.filter(
      (favorito) =>
        !(favorito.usuarioId === usuario.id && favorito.nftId === params.nftId),
    )
    salvarBanco()

    return new HttpResponse(null, { status: 204 })
  }),
]
