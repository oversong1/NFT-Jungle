import type { FiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'
import {
  rotulosCategoria,
  rotulosRaridade,
  rotulosRede,
} from '@/funcionalidades/catalogo/rotulos'

export type FiltroAtivo = {
  chave: 'q' | 'categoria' | 'rede' | 'raridade' | 'precoMin' | 'precoMax'
  rotulo: string
}

/** Lista somente os filtros que diferem do padrão, para virar chips removíveis. */
export function filtrosAtivos(filtros: FiltrosCatalogo): FiltroAtivo[] {
  const ativos: FiltroAtivo[] = []

  if (filtros.q) {
    ativos.push({ chave: 'q', rotulo: `Busca: ${filtros.q}` })
  }
  if (filtros.categoria !== 'todas') {
    ativos.push({
      chave: 'categoria',
      rotulo: `Categoria: ${rotulosCategoria[filtros.categoria]}`,
    })
  }
  if (filtros.rede !== 'todas') {
    ativos.push({ chave: 'rede', rotulo: `Rede: ${rotulosRede[filtros.rede]}` })
  }
  if (filtros.raridade !== 'todas') {
    ativos.push({
      chave: 'raridade',
      rotulo: `Raridade: ${rotulosRaridade[filtros.raridade]}`,
    })
  }
  if (filtros.precoMin) {
    ativos.push({ chave: 'precoMin', rotulo: `Preço mín.: ${filtros.precoMin} ETH` })
  }
  if (filtros.precoMax) {
    ativos.push({ chave: 'precoMax', rotulo: `Preço máx.: ${filtros.precoMax} ETH` })
  }

  return ativos
}
