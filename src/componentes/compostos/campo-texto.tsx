import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/biblioteca/classes'

type PropriedadesCampoTexto = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  rotulo: string
  erro?: string
}

export const CampoTexto = forwardRef<HTMLInputElement, PropriedadesCampoTexto>(
  function CampoTexto({ id, rotulo, erro, className, ...propriedades }, ref) {
    const idErro = `${id}-erro`

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-bold text-titulo">
          {rotulo}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idErro : undefined}
          className={cn(
            'min-h-11 rounded-full border border-[var(--cor-borda)] bg-superficie px-4 text-titulo placeholder:text-texto-suave',
            erro && 'border-erro',
            className,
          )}
          {...propriedades}
        />
        {erro ? (
          <p id={idErro} className="text-sm text-erro">
            {erro}
          </p>
        ) : null}
      </div>
    )
  },
)
