import { createContext, useContext } from 'react'

type ContextoAnunciador = {
  anunciar: (mensagem: string) => void
}

export const ContextoAnunciador = createContext<ContextoAnunciador | null>(null)

export function useAnunciador(): ContextoAnunciador {
  const contexto = useContext(ContextoAnunciador)
  if (!contexto)
    throw new Error('useAnunciador precisa estar dentro de ProvedorAnunciador')
  return contexto
}
