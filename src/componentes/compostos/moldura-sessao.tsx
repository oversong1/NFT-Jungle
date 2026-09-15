import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'

/** Fundo decorativo que sugere a vitrine da home por trás do overlay. */
function FundoVitrine() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-[var(--raio-cartao)] bg-superficie-elevada opacity-60 blur-sm" />
      <div className="absolute right-[-4rem] top-24 h-72 w-72 rounded-[var(--raio-cartao)] bg-superficie-elevada opacity-50 blur-sm" />
      <div className="absolute bottom-[-3rem] left-1/3 h-60 w-80 rounded-[var(--raio-cartao)] bg-superficie-elevada opacity-40 blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgb(210_138_76/12%),transparent_60%)]" />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
    </div>
  )
}

/** Abas de navegação entre entrar e criar conta, no topo do modal. */
function AbasSessao({ ativa }: { ativa: 'entrar' | 'cadastro' }) {
  const classeBase =
    'grid min-h-12 place-items-center text-sm font-black uppercase tracking-wide transition-colors'

  return (
    <div className="grid grid-cols-2 border-b border-[var(--cor-borda)]">
      {ativa === 'entrar' ? (
        <span
          aria-current="page"
          className={`${classeBase} bg-superficie-elevada text-acao`}
        >
          Entrar
        </span>
      ) : (
        <Link to="/entrar" className={`${classeBase} text-texto-suave hover:text-titulo`}>
          Entrar
        </Link>
      )}
      {ativa === 'cadastro' ? (
        <span
          aria-current="page"
          className={`${classeBase} bg-superficie-elevada text-acao`}
        >
          Criar conta
        </span>
      ) : (
        <Link
          to="/cadastro"
          className={`${classeBase} text-texto-suave hover:text-titulo`}
        >
          Criar conta
        </Link>
      )}
    </div>
  )
}

/** Ícone de marca em SVG inline — evita depender de pacote externo só para dois glifos estáticos. */
function IconeGoogle() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4" fill="none">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.27-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}

/** Ícone de marca em SVG inline — evita depender de pacote externo só para dois glifos estáticos. */
function IconeFacebook() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="#1877F2">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.25h3.32l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z" />
    </svg>
  )
}

/**
 * Divisor com dois provedores sociais outline, apenas decorativos (sem OAuth
 * real por trás) — conforme especificação visual: "divisor e dois provedores
 * sociais outline".
 */
export function ProvedoresSociais() {
  const classeBotao =
    'flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-[var(--cor-borda)] text-sm font-bold text-texto transition-colors hover:bg-superficie-elevada'

  return (
    <div className="space-y-4">
      <div
        aria-hidden="true"
        className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-texto-suave"
      >
        <span className="h-px flex-1 bg-[var(--cor-borda)]" />
        ou continue com
        <span className="h-px flex-1 bg-[var(--cor-borda)]" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-3">
        <span className={classeBotao} title="Simulação — sem OAuth real nesta entrega">
          <IconeGoogle />
          Continuar com Google
        </span>
        <span className={classeBotao} title="Simulação — sem OAuth real nesta entrega">
          <IconeFacebook />
          Continuar com Facebook
        </span>
      </div>
    </div>
  )
}

/**
 * Moldura das telas de sessão: overlay escurecido sobre um fundo que evoca a
 * home, com o modal central de abas e a barra inferior laranja.
 */
export function MolduraSessao({
  ativa,
  rotuloTitulo,
  children,
}: {
  ativa: 'entrar' | 'cadastro'
  rotuloTitulo: string
  children: ReactNode
}) {
  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12 sm:px-6"
    >
      <FundoVitrine />

      <section
        aria-labelledby={rotuloTitulo}
        className="relative w-full max-w-md overflow-hidden rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie shadow-[var(--sombra-cartao)]"
      >
        <Link
          to="/"
          search={filtrosPadrao}
          aria-label="Fechar e voltar para o início"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-texto-suave transition-colors hover:bg-superficie-elevada hover:text-titulo"
        >
          <X aria-hidden="true" size={18} />
        </Link>
        <AbasSessao ativa={ativa} />
        <div className="space-y-6 p-6 sm:p-8">{children}</div>
        <div aria-hidden="true" className="h-1.5 bg-acao" />
      </section>
    </main>
  )
}
