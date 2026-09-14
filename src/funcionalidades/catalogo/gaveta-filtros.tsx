import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

import { Botao } from '@/componentes/ui/botao'

type PropriedadesGavetaFiltros = {
  aberta: boolean
  aoFechar: () => void
  children: ReactNode
}

export function GavetaFiltros({ aberta, aoFechar, children }: PropriedadesGavetaFiltros) {
  const referencia = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = referencia.current
    if (!dialogo) return
    if (aberta && !dialogo.open) dialogo.showModal()
    if (!aberta && dialogo.open) dialogo.close()
  }, [aberta])

  return (
    <dialog
      ref={referencia}
      onClose={aoFechar}
      aria-label="Filtros do catálogo"
      className="m-0 h-full max-h-none w-full max-w-sm bg-superficie p-0 text-texto backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-[var(--cor-borda)] p-4">
        <h2 className="text-lg font-bold text-titulo">Filtros</h2>
        <Botao
          type="button"
          variante="secundaria"
          tamanho="icone"
          aria-label="Fechar filtros"
          onClick={aoFechar}
        >
          <X aria-hidden="true" size={18} />
        </Botao>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  )
}
