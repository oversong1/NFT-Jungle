import { z } from 'zod'

export const categoriasCatalogo = [
  'todas',
  'arte',
  'colecionaveis',
  'fotografia',
  'musica',
] as const

export const redesCatalogo = ['todas', 'ethereum', 'polygon', 'arbitrum'] as const

export const raridadesCatalogo = ['todas', 'comum', 'raro', 'epico', 'lendario'] as const

export const ordenacoesCatalogo = [
  'recentes',
  'preco-crescente',
  'preco-decrescente',
  'nome',
] as const

/**
 * Preço em ETH viaja como string decimal ("0.125"), nunca como number.
 * A expressão regular aceita inteiros e até 18 casas decimais.
 * Valor inválido vira undefined (filtro ausente), nunca erro de tela.
 */
const precoDecimal = z
  .string()
  .regex(/^\d+(\.\d{1,18})?$/)
  .optional()
  .catch(undefined)

export const esquemaFiltrosCatalogo = z.object({
  q: z.string().trim().min(1).max(80).optional().catch(undefined),
  categoria: z.enum(categoriasCatalogo).catch('todas'),
  rede: z.enum(redesCatalogo).catch('todas'),
  raridade: z.enum(raridadesCatalogo).catch('todas'),
  precoMin: precoDecimal,
  precoMax: precoDecimal,
  ordenacao: z.enum(ordenacoesCatalogo).catch('recentes'),
  pagina: z.coerce.number().int().min(1).catch(1),
})

export type FiltrosCatalogo = z.infer<typeof esquemaFiltrosCatalogo>
