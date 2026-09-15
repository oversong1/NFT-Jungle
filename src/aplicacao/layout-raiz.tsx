import { Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  Compass,
  Heart,
  Home,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { Rodape } from '@/componentes/compostos/rodape'
import { useCarrinho } from '@/funcionalidades/carrinho/usar-carrinho'
import { MenuSessao } from '@/funcionalidades/sessao/menu-sessao'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'
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

/** Rotas que já são a própria "tela cheia" — a barra não aparece nelas. */
const rotasSemBarraInferior = new Set(['/entrar', '/cadastro'])

/**
 * Barra inferior mobile: início, favoritos, carrinho e perfil, com um botão
 * central flutuante — conforme especificação visual (seção "Estrutura
 * compartilhada"). "Favoritos" ainda não tem uma lista dedicada no escopo
 * desta entrega (favoritar hoje é só um botão por NFT), então fica inerte.
 */
function BarraInferiorMobile() {
  const local = useLocation()
  const sessao = useSessao()
  const carrinho = useCarrinho()
  const quantidade = (carrinho.data?.itens ?? []).reduce(
    (total, item) => total + item.quantidade,
    0,
  )

  if (rotasSemBarraInferior.has(local.pathname)) return null

  const classeItem =
    'flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-bold text-texto-suave transition-colors [&.active]:text-acao'

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#4a2b18] bg-[#1a100b]/95 backdrop-blur lg:hidden"
    >
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-between px-6">
        <Link to="/" search={buscaInicial} className={classeItem}>
          <Home aria-hidden="true" size={20} strokeWidth={1.8} />
          Início
        </Link>
        <span
          aria-disabled="true"
          title="Sem lista de favoritos dedicada nesta entrega — favoritar já funciona no card e no detalhe do NFT."
          className="flex cursor-default flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-bold text-texto-suave/50"
        >
          <Heart aria-hidden="true" size={20} strokeWidth={1.8} />
          Favoritos
        </span>

        <Link
          to="/"
          search={buscaInicial}
          aria-label="Explorar catálogo"
          className="absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#1a100b] bg-acao text-[#160d09] shadow-[0_6px_16px_rgb(0_0_0_/_45%)] transition-transform hover:scale-105"
        >
          <Compass aria-hidden="true" size={24} strokeWidth={2} />
        </Link>

        <Link to="/carrinho" search={{ cupom: undefined }} className={classeItem}>
          <span className="relative">
            <ShoppingCart aria-hidden="true" size={20} strokeWidth={1.8} />
            {quantidade > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-acao px-1 text-[8px] font-black text-[#140d0a]">
                {quantidade > 9 ? '9+' : quantidade}
              </span>
            ) : null}
          </span>
          Carrinho
        </Link>
        <Link to={sessao.data ? '/perfil' : '/entrar'} className={classeItem}>
          <UserRound aria-hidden="true" size={20} strokeWidth={1.8} />
          Perfil
        </Link>
      </div>
    </nav>
  )
}

export function LayoutRaiz() {
  const [menuAberto, definirMenuAberto] = useState(false)
  const fecharMenu = () => definirMenuAberto(false)
  const local = useLocation()
  const semBarraInferior = rotasSemBarraInferior.has(local.pathname)

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
              indice < 1 ? (
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
              indice < 1 ? (
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
      <div className={semBarraInferior ? '' : 'pb-16 lg:pb-0'}>
        <Outlet />
        <Rodape />
      </div>
      <BarraInferiorMobile />
      <PainelDemonstracaoTempoReal />
    </div>
  )
}
