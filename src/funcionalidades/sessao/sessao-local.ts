const CHAVE_TOKEN = 'kurio.token'

export function obterToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN)
}

export function salvarToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token)
}

export function limparToken(): void {
  localStorage.removeItem(CHAVE_TOKEN)
}

export function estaAutenticado(): boolean {
  return obterToken() !== null
}
