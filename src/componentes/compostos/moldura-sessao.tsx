import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

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

/** Divisor com provedores sociais apenas decorativos. */
export function ProvedoresSociais() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-texto-suave">
        <span className="h-px flex-1 bg-[var(--cor-borda)]" />
        ou continue com
        <span className="h-px flex-1 bg-[var(--cor-borda)]" />
      </div>
      <div className="flex justify-center gap-3">
        {['Google', 'Apple', 'Discord'].map((provedor) => (
          <span
            key={provedor}
            title={provedor}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--cor-borda)] bg-superficie-elevada text-sm font-black text-texto"
          >
            {provedor.charAt(0)}
          </span>
        ))}
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
        <AbasSessao ativa={ativa} />
        <div className="space-y-6 p-6 sm:p-8">{children}</div>
        <div aria-hidden="true" className="h-1.5 bg-acao" />
      </section>
    </main>
  )
}
