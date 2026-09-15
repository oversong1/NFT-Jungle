import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import { EVENTO_NFT, EVENTO_PEDIDO } from '@/funcionalidades/tempo-real/contratos'
import { servidorEventos } from '@/mocks/eventos'
import type { Nft, Pedido } from '@/tipos/dominio'

/**
 * Curinga: o socket.io acrescenta /socket.io/ ao endereço, e a aplicação
 * roda em ws://localhost:5173 no dev e wss://<dominio> no deploy.
 */
export const canalTempoReal = ws.link('*')

type ClienteConectado = {
  emitir: (evento: string, dados: unknown) => void
  fechar: () => void
}

const conexoes = new Set<ClienteConectado>()
let emissaoSuspensa = false

type EnvelopeEvento = {
  recursoId: string
  versao: number
  emitidoEm: string
  dados: Nft | Pedido
}

function envelopar(dados: Nft | Pedido): EnvelopeEvento {
  return {
    recursoId: dados.id,
    versao: dados.versao,
    emitidoEm: new Date().toISOString(),
    dados,
  }
}

function transmitir(evento: string, dados: Nft | Pedido) {
  if (emissaoSuspensa) return
  for (const conexao of conexoes) {
    conexao.emitir(evento, envelopar(dados))
  }
}

// A ponte: os handlers REST emitem no barramento em memória; aqui cada
// evento interno vira um quadro Socket.IO com o nome do contrato público.
servidorEventos.assinar('nft:atualizado', (nft) => transmitir(EVENTO_NFT, nft))
servidorEventos.assinar('pedido:atualizado', (pedido) =>
  transmitir(EVENTO_PEDIDO, pedido),
)

export const handlersTempoReal = [
  canalTempoReal.addEventListener('connection', (conexao) => {
    const io = toSocketIo(conexao)
    const cliente: ClienteConectado = {
      emitir: (evento, dados) => io.client.emit(evento, dados as never),
      fechar: () => conexao.client.close(),
    }
    conexoes.add(cliente)

    conexao.client.addEventListener('close', () => {
      conexoes.delete(cliente)
    })
  }),
]

/** Demonstração de queda: para de emitir, como se o servidor tivesse caído. */
export function suspenderEmissao(valor: boolean) {
  emissaoSuspensa = valor
}

/** Demonstração de desconexão: derruba todas as conexões ativas. */
export function derrubarConexoes() {
  for (const conexao of conexoes) conexao.fechar()
  conexoes.clear()
}
