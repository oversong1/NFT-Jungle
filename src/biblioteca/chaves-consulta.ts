import type { FiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'

/**
 * Fábrica única de chaves do TanStack Query.
 * Chaves iniciadas por 'privado' carregam dados de um usuário e são
 * removidas do cache em logout, troca de usuário ou sessão expirada.
 */
export const chaves = {
  sessao: ['sessao'] as const,
  catalogo: (filtros: FiltrosCatalogo) => ['catalogo', filtros] as const,
  nft: (nftId: string) => ['nft', nftId] as const,
  favoritos: (usuarioId: string) => ['privado', 'favoritos', usuarioId] as const,
  carrinho: (identidade: string) => ['carrinho', identidade] as const,
  cotacao: (identidade: string, cupom: string | null) =>
    ['cotacao', identidade, cupom ?? 'sem-cupom'] as const,
  pedidos: (usuarioId: string) => ['privado', 'pedidos', usuarioId] as const,
  pedido: (usuarioId: string, pedidoId: string) =>
    ['privado', 'pedidos', usuarioId, pedidoId] as const,
  perfil: (usuarioId: string) => ['privado', 'perfil', usuarioId] as const,
  carteiras: (usuarioId: string) => ['privado', 'carteiras', usuarioId] as const,
  /** Prefixo de todas as cotações de uma identidade, com qualquer cupom. Usado em invalidação. */
  cotacoes: (identidade: string) => ['cotacao', identidade] as const,
}

export function chaveEhPrivada(chave: readonly unknown[]): boolean {
  return chave[0] === 'privado'
}
