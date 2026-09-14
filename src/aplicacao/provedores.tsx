import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'

import { roteador } from '@/aplicacao/rotas'
import { chaveEhPrivada, chaves } from '@/biblioteca/chaves-consulta'
import type { ErroApi } from '@/tipos/api'

export const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (tentativas, erro) => {
        const erroApi = erro as ErroApi
        // Erro 4xx é definitivo (credencial, validação, inexistente):
        // repetir não muda o resultado.
        if (erroApi.status >= 400 && erroApi.status < 500) return false
        return tentativas < 2
      },
    },
    mutations: {
      // Mutations nunca repetem sozinhas; criação de pedido em especial.
      retry: 0,
    },
  },
})

/** Remove do cache tudo que pertence a um usuário. */
export function limparCachePrivado(cliente: QueryClient): void {
  void cliente.cancelQueries()
  cliente.removeQueries({
    predicate: (consulta) => chaveEhPrivada(consulta.queryKey),
  })
  cliente.removeQueries({ queryKey: chaves.sessao })
}

export function Provedores({ children }: { children: ReactNode }) {
  useEffect(() => {
    function aoExpirarSessao() {
      // Preserva a intenção de retorno e o carrinho; remove só o privado.
      limparCachePrivado(clienteConsultas)

      const destino = roteador.state.location.href
      if (!destino.startsWith('/entrar')) {
        void roteador.navigate({ to: '/entrar', search: { redirect: destino } })
      }
    }

    window.addEventListener('kurio:sessao-expirada', aoExpirarSessao)
    return () => {
      window.removeEventListener('kurio:sessao-expirada', aoExpirarSessao)
    }
  }, [])

  return (
    <QueryClientProvider client={clienteConsultas}>{children}</QueryClientProvider>
  )
}