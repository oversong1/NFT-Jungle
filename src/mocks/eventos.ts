import type { Nft, Pedido } from '@/tipos/dominio'

export type EventosServidor = {
  'pedido:atualizado': Pedido
  'nft:atualizado': Nft
}

type Ouvinte<T> = (dados: T) => void

/**
 * Barramento em memória que faz o papel do servidor Socket.IO.
 * Handlers REST emitem aqui; na Fase 9 o cliente de tempo real
 * assina estes eventos quando os mocks estão ativos.
 */
class EmissorEventos {
  private ouvintes = new Map<keyof EventosServidor, Set<Ouvinte<never>>>()

  assinar<K extends keyof EventosServidor>(
    evento: K,
    ouvinte: Ouvinte<EventosServidor[K]>,
  ): () => void {
    if (!this.ouvintes.has(evento)) this.ouvintes.set(evento, new Set())
    this.ouvintes.get(evento)!.add(ouvinte as Ouvinte<never>)

    return () => {
      this.ouvintes.get(evento)?.delete(ouvinte as Ouvinte<never>)
    }
  }

  emitir<K extends keyof EventosServidor>(evento: K, dados: EventosServidor[K]): void {
    this.ouvintes.get(evento)?.forEach((ouvinte) => {
      ;(ouvinte as Ouvinte<EventosServidor[K]>)(dados)
    })
  }
}

export const servidorEventos = new EmissorEventos()
