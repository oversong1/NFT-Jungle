import { setupWorker } from 'msw/browser'

import { reiniciarBanco } from '@/mocks/armazenamento'
import { cenariosDisponiveis, definirCenario, obterCenario } from '@/mocks/cenarios'
import { todosHandlers } from '@/mocks/handlers/indice'
import { handlersTempoReal } from '@/mocks/tempo-real'

export const worker = setupWorker(...todosHandlers, ...handlersTempoReal)

/**
 * Ferramentas manuais de teste, disponíveis no console do navegador:
 *   kurio.definirCenario('lento'); location.reload()
 *   kurio.reiniciarBanco(); location.reload()
 */
declare global {
  interface Window {
    kurio: {
      cenarios: readonly string[]
      obterCenario: typeof obterCenario
      definirCenario: typeof definirCenario
      reiniciarBanco: typeof reiniciarBanco
    }
  }
}

window.kurio = {
  cenarios: cenariosDisponiveis,
  obterCenario,
  definirCenario,
  reiniciarBanco,
}
