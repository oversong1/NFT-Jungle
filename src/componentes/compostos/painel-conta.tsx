import { Link } from '@tanstack/react-router'
import { UserRound, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

const ligacoesConta = [
  { rotulo: 'Meu perfil', para: '/perfil', Icone: UserRound },
  { rotulo: 'Minhas carteiras', para: '/carteiras', Icone: Wallet },
] as const

/**
 * Painel lateral compartilhado das telas de conta.
 * No desktop vive como coluna fixa à esquerda; no mobile vira um cartão
 * empilhado acima do conteúdo.
 */
export function PainelConta({ children }: { children?: ReactNode }) {
  return (
    <aside
      aria-label="Painel da conta"
      className="h-fit space-y-6 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-5 lg:sticky lg:top-6"
    >
      {children}

      <nav aria-label="Seções da conta" className="flex flex-col gap-1.5">
        {ligacoesConta.map(({ rotulo, para, Icone }) => (
          <Link
            key={para}
            to={para}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-texto transition-colors hover:bg-superficie-elevada hover:text-titulo [&.active]:bg-superficie-elevada [&.active]:text-acao"
          >
            <Icone aria-hidden="true" size={18} strokeWidth={1.8} />
            {rotulo}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
