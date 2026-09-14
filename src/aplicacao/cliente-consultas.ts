import { QueryClient } from '@tanstack/react-query'

import { chaveEhPrivada, chaves } from '@/biblioteca/chaves-consulta'
import type { ErroApi } from '@/tipos/api'

export const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (tentativas, erro) => {
        const erroApi = erro as unknown as ErroApi

        if (erroApi.status >= 400 && erroApi.status < 500) return false
        return tentativas < 2
      },
    },
    mutations: {
      retry: 0,
    },
  },
})

/** Remove do cache tudo que pertence a uma sessão autenticada. */
export function limparCachePrivado(cliente: QueryClient): void {
  void cliente.cancelQueries()
  cliente.removeQueries({
    predicate: (consulta) => chaveEhPrivada(consulta.queryKey),
  })
  cliente.removeQueries({ queryKey: chaves.sessao })
}
