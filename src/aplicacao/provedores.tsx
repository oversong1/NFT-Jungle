import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'

import { clienteConsultas, limparCachePrivado } from '@/aplicacao/cliente-consultas'
import { roteador } from '@/aplicacao/rotas'

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

  return <QueryClientProvider client={clienteConsultas}>{children}</QueryClientProvider>
}
