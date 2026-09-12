import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { PaginaInicial } from '@/aplicacao/paginas/pagina-inicial'
import {
  PaginaCadastro,
  PaginaCarrinho,
  PaginaCarteiras,
  PaginaConfirmacaoPedido,
  PaginaDetalheNft,
  PaginaEntrar,
  PaginaNaoEncontrada,
  PaginaPagamento,
  PaginaPerfil,
} from '@/aplicacao/paginas/provisorias'
import { esquemaFiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'
import { estaAutenticado } from '@/funcionalidades/sessao/sessao-local'

/**
 * Guarda de rota privada. Se não há sessão, redireciona para /entrar
 * preservando o endereço completo de destino em `redirect`.
 */
function exigirSessao(destino: string): void {
  if (!estaAutenticado()) {
    throw redirect({ to: '/entrar', search: { redirect: destino } })
  }
}

function LayoutRaiz() {
  return (
    <div className="min-h-screen bg-fundo">
      <header className="border-b border-[var(--cor-borda)]">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-sm font-bold text-texto sm:px-6 lg:px-8"
        >
          {/* @ts-expect-error */}
          <Link
            to={'/'}
            className="text-base font-black uppercase tracking-tight text-titulo"
          >
            Kurio
          </Link>
          {/* @ts-expect-error */}
          <Link to="/" className="hover:text-titulo [&.active]:text-destaque">
            Catálogo
          </Link>
          <Link to="/carrinho" className="hover:text-titulo [&.active]:text-destaque">
            Carrinho
          </Link>
          <Link to="/perfil" className="hover:text-titulo [&.active]:text-destaque">
            Perfil
          </Link>
          <Link to="/carteiras" className="hover:text-titulo [&.active]:text-destaque">
            Carteiras
          </Link>
          <Link
            to="/entrar"
            className="ml-auto hover:text-titulo [&.active]:text-destaque"
          >
            Entrar
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
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
