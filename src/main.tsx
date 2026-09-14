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

void prepararMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provedores>
        <RouterProvider router={roteador} />
      </Provedores>
    </StrictMode>,
  )
})
