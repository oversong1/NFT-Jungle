import { Link, Outlet } from '@tanstack/react-router'

import { MenuSessao } from '@/funcionalidades/sessao/menu-sessao'
import { PainelDemonstracaoTempoReal } from '@/funcionalidades/tempo-real/painel-demonstracao'

export function LayoutRaiz() {
  return (
    <div className="min-h-screen bg-fundo">
      <a
        href="#conteudo"
        className="sr-only rounded-full bg-acao px-5 py-2.5 font-bold text-fundo focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-[var(--cor-borda)]">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-sm font-bold text-texto sm:px-6 lg:px-8"
        >
          <Link
            to="/"
            search={{
              categoria: 'todas',
              rede: 'todas',
              raridade: 'todas',
              ordenacao: 'recentes',
              pagina: 1,
            }}
            className="text-base font-black uppercase tracking-tight text-titulo"
          >
            Kurio
          </Link>
          <Link
            to="/"
            search={{
              categoria: 'todas',
              rede: 'todas',
              raridade: 'todas',
              ordenacao: 'recentes',
              pagina: 1,
            }}
            className="hover:text-titulo [&.active]:text-destaque"
          >
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
          <MenuSessao />
        </nav>
      </header>
      <Outlet />
      <PainelDemonstracaoTempoReal />
    </div>
  )
}
