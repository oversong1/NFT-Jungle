import { Link, Outlet } from '@tanstack/react-router'
import { Menu, Search, ShoppingCart, X } from 'lucide-react'
import { useState } from 'react'

import { Rodape } from '@/componentes/compostos/rodape'
import { useCarrinho } from '@/funcionalidades/carrinho/usar-carrinho'
import { MenuSessao } from '@/funcionalidades/sessao/menu-sessao'
import { PainelDemonstracaoTempoReal } from '@/funcionalidades/tempo-real/painel-demonstracao'

const buscaInicial = {
  categoria: 'todas',
  rede: 'todas',
  raridade: 'todas',
  ordenacao: 'recentes',
  pagina: 1,
} as const

const itensNavegacao = ['Início', 'Mercado', 'Criadores', 'Aprenda']

function BotaoCarrinho({ aoNavegar }: { aoNavegar: () => void }) {
  const carrinho = useCarrinho()
  const quantidade = (carrinho.data?.itens ?? []).reduce(
    (total, item) => total + item.quantidade,
    0,
  )

  return (
    <Link
      to="/carrinho"
      onClick={aoNavegar}
      aria-label={`Carrinho com ${quantidade} ${quantidade === 1 ? 'item' : 'itens'}`}
      className="relative grid h-10 w-10 place-items-center text-titulo transition-colors hover:text-acao"
    >
      <ShoppingCart aria-hidden="true" size={20} strokeWidth={1.7} />
      {quantidade > 0 ? (
        <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-acao px-1 text-[9px] font-black text-[#140d0a]">
          {quantidade > 9 ? '9+' : quantidade}
        </span>
      ) : null}
    </Link>
  )
}

export function LayoutRaiz() {
  const [menuAberto, definirMenuAberto] = useState(false)
  const fecharMenu = () => definirMenuAberto(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-fundo">
      <a
        href="#conteudo"
        className="sr-only bg-acao px-5 py-2.5 font-bold text-fundo focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Pular para o conteúdo
      </a>
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Navegação principal"
          className="relative flex min-h-18 items-center border-b border-[#4a2b18]"
        >
          <Link
            to="/"
            search={buscaInicial}
            onClick={fecharMenu}
            className="mr-auto text-xs font-black uppercase tracking-[0.16em] text-titulo"
          >
            Kurio
          </Link>
          <div className="hidden h-full items-center gap-8 lg:flex">
            {itensNavegacao.map((item, indice) =>
              indice < 2 ? (
                <Link
                  key={item}
                  to="/"
                  search={buscaInicial}
                  className="border-b-2 border-transparent py-6 text-xs font-medium text-titulo transition hover:border-acao hover:text-acao [&.active]:border-acao [&.active]:text-acao"
                >
                  {item}
                </Link>
              ) : (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="py-6 text-xs font-medium text-titulo transition hover:text-acao"
                >
                  {item}
                </a>
              ),
            )}
          </div>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <button
              type="button"
              aria-label="Buscar"
              className="grid h-10 w-10 place-items-center text-titulo hover:text-acao"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>
            <BotaoCarrinho aoNavegar={fecharMenu} />
            <MenuSessao />
          </div>
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <BotaoCarrinho aoNavegar={fecharMenu} />
            <button
              type="button"
              aria-label={
                menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
              }
              aria-expanded={menuAberto}
              aria-controls="menu-principal"
              onClick={() => definirMenuAberto((aberto) => !aberto)}
              className="grid h-11 w-11 place-items-center text-titulo"
            >
              {menuAberto ? (
                <X aria-hidden="true" size={23} />
              ) : (
                <Menu aria-hidden="true" size={23} />
              )}
            </button>
          </div>
          <div
            id="menu-principal"
            className={`${menuAberto ? 'flex' : 'hidden'} absolute left-0 right-0 top-full z-50 flex-col border border-[#4a2b18] bg-[#211510] p-4 shadow-2xl lg:hidden`}
          >
            {itensNavegacao.map((item, indice) =>
              indice < 2 ? (
                <Link
                  key={item}
                  to="/"
                  search={buscaInicial}
                  onClick={fecharMenu}
                  className="border-b border-[#4a2b18] px-3 py-3 text-sm font-bold text-titulo hover:bg-[#322016] hover:text-acao"
                >
                  {item}
                </Link>
              ) : (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={fecharMenu}
                  className="border-b border-[#4a2b18] px-3 py-3 text-sm font-bold text-titulo hover:bg-[#322016] hover:text-acao"
                >
                  {item}
                </a>
              ),
            )}
            <div className="pt-4">
              <MenuSessao />
            </div>
          </div>
        </nav>
      </header>
      <Outlet />
      <Rodape />
      <PainelDemonstracaoTempoReal />
    </div>
  )
}
