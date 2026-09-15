import { useState } from 'react'

import { clienteHttp } from '@/biblioteca/http'
import { Botao } from '@/componentes/ui/botao'

export function PainelDemonstracaoTempoReal() {
  const [aberto, definirAberto] = useState(false)
  const [ultimaAcao, definirUltimaAcao] = useState('')

  // Só existe com os mocks ativos — inclusive no build de demonstração.
  if (import.meta.env.VITE_USAR_MOCKS !== 'true') return null

  async function executar(comando: string, extras: Record<string, string> = {}) {
    try {
      await clienteHttp.post('/dev/eventos', { comando, ...extras })
      definirUltimaAcao(`Comando enviado: ${comando}`)
    } catch {
      definirUltimaAcao(`Falha ao enviar: ${comando}`)
    }
  }

  async function reiniciar() {
    try {
      await clienteHttp.post('/dev/reset', {})
      window.location.reload()
    } catch {
      definirUltimaAcao('Falha ao reiniciar os dados.')
    }
  }

  if (!aberto) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Botao
          type="button"
          variante="secundaria"
          tamanho="pequeno"
          onClick={() => definirAberto(true)}
        >
          Demonstração
        </Botao>
      </div>
    )
  }

  return (
    <section
      aria-label="Painel de demonstração de tempo real"
      className="fixed bottom-4 right-4 z-50 max-w-xs space-y-2 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie-elevada p-4 shadow-[var(--sombra-cartao)]"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-titulo">Demonstração — tempo real</h2>
        <Botao
          type="button"
          variante="texto"
          tamanho="pequeno"
          onClick={() => definirAberto(false)}
        >
          Fechar
        </Botao>
      </div>
      <div className="flex flex-wrap gap-2">
        <Botao
          type="button"
          tamanho="pequeno"
          variante="secundaria"
          onClick={() => void executar('nft-preco', { precoEth: '0.999000' })}
        >
          Mudar preço do nft-01
        </Botao>
        <Botao
          type="button"
          tamanho="pequeno"
          variante="secundaria"
          onClick={() => void executar('nft-esgotar')}
        >
          Esgotar nft-01
        </Botao>
        <Botao
          type="button"
          tamanho="pequeno"
          variante="secundaria"
          onClick={() => void executar('evento-antigo')}
        >
          Evento antigo
        </Botao>
        <Botao
          type="button"
          tamanho="pequeno"
          variante="secundaria"
          onClick={() => void executar('evento-duplicado')}
        >
          Evento duplicado
        </Botao>
        <Botao
          type="button"
          tamanho="pequeno"
          variante="secundaria"
          onClick={() => void executar('derrubar-conexao')}
        >
          Derrubar conexão
        </Botao>
        <Botao
          type="button"
          tamanho="pequeno"
          variante="secundaria"
          onClick={() => void executar('permitir-conexao')}
        >
          Permitir reconexão
        </Botao>
      </div>
      <Botao
        type="button"
        tamanho="pequeno"
        variante="primaria"
        className="w-full"
        onClick={() => void reiniciar()}
      >
        Reiniciar dados de demonstração
      </Botao>
      <p role="status" aria-live="polite" className="min-h-4 text-xs text-texto-suave">
        {ultimaAcao}
      </p>
    </section>
  )
}
