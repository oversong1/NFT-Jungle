import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { chaves } from '@/biblioteca/chaves-consulta'
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from '@/funcionalidades/catalogo/api-favoritos'

export function useFavoritos(usuarioId: string | undefined) {
  return useQuery({
    queryKey: chaves.favoritos(usuarioId ?? 'anonimo'),
    queryFn: listarFavoritos,
    // Sem usuário não há favoritos: a consulta nem dispara.
    enabled: Boolean(usuarioId),
  })
}

type VariaveisFavorito = {
  nftId: string
  /** Estado ATUAL: true = já é favorito, então a ação é remover. */
  favorito: boolean
}

/**
 * Mutation otimista: a interface muda na hora; se o servidor falhar,
 * o snapshot anterior é restaurado (rollback) e depois revalidado.
 */
export function useAlternarFavorito(usuarioId: string) {
  const cliente = useQueryClient()
  const chave = chaves.favoritos(usuarioId)

  return useMutation({
    mutationFn: ({ nftId, favorito }: VariaveisFavorito) =>
      favorito ? removerFavorito(nftId) : adicionarFavorito(nftId),

    onMutate: async ({ nftId, favorito }) => {
      // 1. Cancela buscas em voo para a resposta antiga não atropelar.
      await cliente.cancelQueries({ queryKey: chave })

      // 2. Snapshot para rollback.
      const anterior = cliente.getQueryData<string[]>(chave)

      // 3. Atualização otimista imediata.
      cliente.setQueryData<string[]>(chave, (atual = []) =>
        favorito ? atual.filter((id) => id !== nftId) : [...atual, nftId],
      )

      return { anterior }
    },

    onError: (_erro, _variaveis, contexto) => {
      // Rollback: devolve o cache exatamente ao estado do snapshot.
      if (contexto) cliente.setQueryData(chave, contexto.anterior)
    },

    onSettled: () => {
      // Sucesso ou falha, o servidor é a verdade final.
      void cliente.invalidateQueries({ queryKey: chave })
    },
  })
}
