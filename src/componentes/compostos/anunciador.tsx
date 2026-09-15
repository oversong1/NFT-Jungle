import { useCallback, useRef, useState, type ReactNode } from 'react'

import { ContextoAnunciador } from './anunciador-contexto'

export function ProvedorAnunciador({ children }: { children: ReactNode }) {
  const [mensagem, definirMensagem] = useState('')
  const temporizador = useRef<number | undefined>(undefined)

  const anunciar = useCallback((novaMensagem: string) => {
    definirMensagem('')
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => definirMensagem(novaMensagem), 80)
  }, [])

  return (
    <ContextoAnunciador.Provider value={{ anunciar }}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {mensagem}
      </div>
    </ContextoAnunciador.Provider>
  )
}
