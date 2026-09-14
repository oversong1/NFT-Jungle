import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { chaves } from '@/biblioteca/chaves-consulta'
import { buscarNftPorId, buscarNfts } from '@/funcionalidades/catalogo/api-catalogo'
import type { FiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'

/**
 * Catálogo paginado. A chave inclui o objeto de filtros inteiro:
 * cada combinação é uma entrada separada do cache e respostas de
 * combinações diferentes nunca disputam a mesma chave.
 */
export function useCatalogo(filtros: FiltrosCatalogo) {
  return useQuery({
    queryKey: chaves.catalogo(filtros),
    queryFn: ({ signal }) => buscarNfts(filtros, signal),
    placeholderData: keepPreviousData,
  })
}

/** Detalhe por id. O 404 não é retentado (política global de 4xx). */
export function useNft(nftId: string) {
  return useQuery({
    queryKey: chaves.nft(nftId),
    queryFn: ({ signal }) => buscarNftPorId(nftId, signal),
  })
}
