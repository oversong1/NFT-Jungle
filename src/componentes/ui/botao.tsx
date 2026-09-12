import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/biblioteca/classes'

const variantesBotao = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variante: {
        primaria: 'bg-acao text-fundo hover:bg-destaque',
        secundaria:
          'border border-[var(--cor-borda)] bg-transparent text-titulo hover:bg-superficie-elevada',
        texto: 'text-destaque hover:text-titulo',
      },
      tamanho: {
        padrao: '',
        pequeno: 'min-h-9 px-3 py-2 text-xs',
        icone: 'min-h-11 min-w-11 p-0',
      },
    },
    defaultVariants: {
      variante: 'primaria',
      tamanho: 'padrao',
    },
  },
)

type PropriedadesBotao = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variantesBotao> & {
    comoFilho?: boolean
  }

export function Botao({
  className,
  variante,
  tamanho,
  comoFilho = false,
  ...propriedades
}: PropriedadesBotao) {
  const Componente = comoFilho ? Slot : 'button'

  return (
    <Componente
      className={cn(variantesBotao({ variante, tamanho }), className)}
      {...propriedades}
    />
  )
}
