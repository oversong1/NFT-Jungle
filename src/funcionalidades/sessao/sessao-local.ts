import { useSyncExternalStore } from 'react'

const CHAVE_TOKEN = 'kurio.token'
const EVENTO_SESSAO = 'kurio:sessao-local-alterada'

export function obterToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN)
}

function notificarAlteracao(): void {
  window.dispatchEvent(new Event(EVENTO_SESSAO))
}

export function salvarToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token)
  notificarAlteracao()
}

export function limparToken(): void {
  localStorage.removeItem(CHAVE_TOKEN)
  notificarAlteracao()
}

export function estaAutenticado(): boolean {
  return obterToken() !== null
}

function assinar(aoAlterar: () => void): () => void {
  window.addEventListener(EVENTO_SESSAO, aoAlterar)
  window.addEventListener('storage', aoAlterar)
  return () => {
    window.removeEventListener(EVENTO_SESSAO, aoAlterar)
    window.removeEventListener('storage', aoAlterar)
  }
}

export function useEstaAutenticado(): boolean {
  return useSyncExternalStore(assinar, estaAutenticado, () => false)
}
