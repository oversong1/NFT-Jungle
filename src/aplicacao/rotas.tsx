import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { LayoutRaiz } from '@/aplicacao/layout-raiz'
import { PaginaInicial } from '@/aplicacao/paginas/pagina-inicial'
import {
  PaginaCarrinho,
  PaginaCarteiras,
  PaginaConfirmacaoPedido,
  PaginaNaoEncontrada,
  PaginaPagamento,
  PaginaPerfil,
} from '@/aplicacao/paginas/provisorias'
import { esquemaFiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'
import { estaAutenticado } from '@/funcionalidades/sessao/sessao-local'

import { PaginaCadastro } from '@/aplicacao/paginas/pagina-cadastro'
import { PaginaEntrar } from '@/aplicacao/paginas/pagina-entrar'
import { PaginaDetalheNft } from '@/aplicacao/paginas/pagina-detalhe-nft'

/**
 * Guarda de rota privada. Se não há sessão, redireciona para /entrar
 * preservando o endereço completo de destino em `redirect`.
 */
function exigirSessao(destino: string): void {
  if (!estaAutenticado()) {
    throw redirect({ to: '/entrar', search: { redirect: destino } })
  }
}

const rotaRaiz = createRootRoute({
  component: LayoutRaiz,
  notFoundComponent: PaginaNaoEncontrada,
})

const rotaInicial = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/',
  validateSearch: zodValidator(esquemaFiltrosCatalogo),
  component: PaginaInicial,
})

const rotaDetalheNft = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/nfts/$nftId',
  component: PaginaDetalheNft,
})

const rotaCarrinho = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/carrinho',
  component: PaginaCarrinho,
})

const rotaPagamento = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/pagamento',
  beforeLoad: ({ location }) => exigirSessao(location.href),
  component: PaginaPagamento,
})

const rotaConfirmacaoPedido = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/pedido/$orderId/confirmacao',
  beforeLoad: ({ location }) => exigirSessao(location.href),
  component: PaginaConfirmacaoPedido,
})

const rotaEntrar = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/entrar',
  validateSearch: zodValidator(
    z.object({
      redirect: z.string().optional().catch(undefined),
    }),
  ),
  component: PaginaEntrar,
})

const rotaCadastro = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/cadastro',
  component: PaginaCadastro,
})

const rotaPerfil = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/perfil',
  beforeLoad: ({ location }) => exigirSessao(location.href),
  component: PaginaPerfil,
})

const rotaCarteiras = createRoute({
  getParentRoute: () => rotaRaiz,
  path: '/carteiras',
  beforeLoad: ({ location }) => exigirSessao(location.href),
  component: PaginaCarteiras,
})

const arvoreDeRotas = rotaRaiz.addChildren([
  rotaInicial,
  rotaDetalheNft,
  rotaCarrinho,
  rotaPagamento,
  rotaConfirmacaoPedido,
  rotaEntrar,
  rotaCadastro,
  rotaPerfil,
  rotaCarteiras,
])

export const roteador = createRouter({
  routeTree: arvoreDeRotas,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof roteador
  }
}
