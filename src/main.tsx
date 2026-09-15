import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { Provedores } from '@/aplicacao/provedores'
import { roteador } from '@/aplicacao/rotas'
import './index.css'

async function prepararMocks(): Promise<void> {
  if (import.meta.env.VITE_USAR_MOCKS !== 'true') return

  const { worker } = await import('@/mocks/navegador')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

function renderizarAplicacao(): void {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provedores>
        <RouterProvider router={roteador} />
      </Provedores>
    </StrictMode>,
  )
}

void prepararMocks()
  .catch((erro: unknown) => {
    // Se o Service Worker do MSW não registrar (extensões de navegador,
    // navegação anônima restrita, etc.), a aplicação ainda deve subir —
    // sem mocks a API simplesmente responderá com falha de rede.
    console.error('[Kurio] Falha ao preparar os mocks; seguindo sem eles.', erro)
  })
  .then(renderizarAplicacao)
