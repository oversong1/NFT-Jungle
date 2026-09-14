import type {
  categoriasCatalogo,
  ordenacoesCatalogo,
  raridadesCatalogo,
  redesCatalogo,
} from '@/funcionalidades/catalogo/esquema-filtros'

export const rotulosCategoria: Record<(typeof categoriasCatalogo)[number], string> = {
  todas: 'Todas',
  arte: 'Arte',
  colecionaveis: 'Colecionáveis',
  fotografia: 'Fotografia',
  musica: 'Música',
}

export const rotulosRede: Record<(typeof redesCatalogo)[number], string> = {
  todas: 'Todas',
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
}

export const rotulosRaridade: Record<(typeof raridadesCatalogo)[number], string> = {
  todas: 'Todas',
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
}

export const rotulosOrdenacao: Record<(typeof ordenacoesCatalogo)[number], string> = {
  recentes: 'Mais recentes',
  'preco-crescente': 'Menor preço',
  'preco-decrescente': 'Maior preço',
  nome: 'Nome (A–Z)',
}
