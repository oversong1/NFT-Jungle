import { Link } from '@tanstack/react-router'
import {
  Activity,
  Download,
  Heart,
  LifeBuoy,
  LogOut,
  Tag,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { useSair } from '@/funcionalidades/sessao/usar-sessao'

const ligacoesConta = [
  { rotulo: 'Meu perfil', para: '/perfil', Icone: UserRound },
  { rotulo: 'Minhas carteiras', para: '/carteiras', Icone: Wallet },
] as const

/**
 * Itens que existem na referência visual (mockup 08/09) mas não fazem parte
 * do escopo funcional do desafio (enunciado pede só Perfil e Carteiras) —
 * ficam visíveis para bater com o layout de referência, mas inertes.
 */
const ligacoesFuturas = [
  { rotulo: 'Atividade', Icone: Activity },
  { rotulo: 'Lista de interesse', Icone: Heart },
  { rotulo: 'Ofertas', Icone: Tag },
  { rotulo: 'Arquivos baixados', Icone: Download },
  { rotulo: 'Suporte', Icone: LifeBuoy },
] as const

/**
 * Painel lateral compartilhado das telas de conta.
 * No desktop vive como coluna fixa à esquerda; no mobile vira um cartão
 * empilhado acima do conteúdo.
 */
export function PainelConta({ children }: { children?: ReactNode }) {
  const sairMutation = useSair()

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

        {ligacoesFuturas.map(({ rotulo, Icone }) => (
          <span
            key={rotulo}
            aria-disabled="true"
            title="Fora do escopo funcional desta entrega — presente só para compor o layout de referência."
            className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-texto-suave/60"
          >
            <Icone aria-hidden="true" size={18} strokeWidth={1.8} />
            {rotulo}
          </span>
        ))}

        <button
          type="button"
          onClick={() => sairMutation.mutate()}
          disabled={sairMutation.isPending}
          className="mt-1.5 flex items-center gap-3 rounded-xl border-t border-[var(--cor-borda)] px-3 py-2.5 pt-4 text-sm font-bold text-acao transition-colors hover:bg-superficie-elevada disabled:opacity-50"
        >
          <LogOut aria-hidden="true" size={18} strokeWidth={1.8} />
          {sairMutation.isPending ? 'Saindo…' : 'Sair'}
        </button>
      </nav>
    </aside>
  )
}
