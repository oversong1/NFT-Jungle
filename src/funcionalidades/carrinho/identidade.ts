const CHAVE_IDENTIDADE = 'kurio.identidade-anonima'

/** Lê sem criar. Usada na mesclagem do login: se nunca houve visitante, não há o que mesclar. */
export function lerIdentidadeAnonima(): string | null {
  return localStorage.getItem(CHAVE_IDENTIDADE)
}

/** Lê ou cria o identificador anônimo. Usada pelo interceptor do Axios. */
export function obterIdentidadeAnonima(): string {
  const existente = lerIdentidadeAnonima()
  if (existente) return existente

  const nova = crypto.randomUUID()
  localStorage.setItem(CHAVE_IDENTIDADE, nova)
  return nova
}

/** Descartada após a mesclagem no login: o carrinho antigo de visitante não "volta" no logout. */
export function descartarIdentidadeAnonima(): void {
  localStorage.removeItem(CHAVE_IDENTIDADE)
}

/**
 * A MESMA regra do servidor (identidadeDaRequisicao em src/mocks/apoio.ts):
 * usuário logado é 'usuario:<id>'; visitante é 'anonimo:<uuid>'.
 * É esta string que entra nas chaves de cache do carrinho e da cotação.
 */
export function identidadeDoCarrinho(usuarioId: string | undefined): string {
  return usuarioId ? `usuario:${usuarioId}` : `anonimo:${obterIdentidadeAnonima()}`
}
