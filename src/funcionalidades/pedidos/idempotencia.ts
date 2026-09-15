const CHAVE_ARMAZENAMENTO = 'kurio.tentativa-de-pedido'

export type TentativaDePedido = {
  chave: string
  hash: string
  pedidoId: string | null
}

/** O que a tentativa compra: itens ordenados + cupom + carteira. */
export function hashDaCompra(entrada: {
  itens: Array<{ nftId: string; quantidade: number }>
  cupom: string | null
  carteiraId: string | null
}): string {
  const itens = [...entrada.itens]
    .map((item) => ({ nftId: item.nftId, quantidade: item.quantidade }))
    .sort((a, b) => a.nftId.localeCompare(b.nftId))
  return JSON.stringify({ itens, cupom: entrada.cupom, carteiraId: entrada.carteiraId })
}

export function lerTentativa(): TentativaDePedido | null {
  const bruto = sessionStorage.getItem(CHAVE_ARMAZENAMENTO)
  return bruto ? (JSON.parse(bruto) as TentativaDePedido) : null
}

/** Mesmo conteúdo reutiliza a chave; conteúdo diferente gera chave nova. */
export function obterOuCriarTentativa(hash: string): TentativaDePedido {
  const atual = lerTentativa()
  if (atual && atual.hash === hash) return atual

  const nova: TentativaDePedido = {
    chave: crypto.randomUUID(),
    hash,
    pedidoId: null,
  }
  sessionStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(nova))
  return nova
}

/** Grava o pedido criado: o F5 durante a pendência recupera por aqui. */
export function registrarPedidoNaTentativa(pedidoId: string): void {
  const atual = lerTentativa()
  if (!atual) return
  sessionStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({ ...atual, pedidoId }))
}

/** Tentativa termina quando o pedido chega a um estado terminal. */
export function encerrarTentativa(): void {
  sessionStorage.removeItem(CHAVE_ARMAZENAMENTO)
}
