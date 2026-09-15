import { io, type Socket } from 'socket.io-client'

/**
 * Mesma origem da aplicação (localhost em dev, domínio público no deploy).
 * Com os mocks ativos, o MSW intercepta esta conexão; contra um backend
 * real, bastaria apontar para o endereço do servidor de eventos.
 */
function enderecoTempoReal(): string {
  const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocolo}://${window.location.host}`
}

let instancia: Socket | null = null

/**
 * Instância única para a aplicação toda, criada desconectada.
 * Quem liga e desliga é o hook de tempo real — e o módulo único também
 * evita dois sockets quando o StrictMode monta os componentes duas vezes.
 */
export function obterSocket(): Socket {
  if (!instancia) {
    instancia = io(enderecoTempoReal(), {
      // Obrigatório: o MSW intercepta somente o transporte WebSocket;
      // a sondagem HTTP do Socket.IO não passa pelo binding.
      transports: ['websocket'],
      // Não conecta antes de a sessão ser conhecida (o hook decide).
      autoConnect: false,
    })
  }
  return instancia
}
