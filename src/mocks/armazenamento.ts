import type { Carrinho, Carteira, Favorito, Nft, Pedido } from '@/tipos/dominio'

import {
  carteirasIniciais,
  nftsIniciais,
  usuariosIniciais,
  type UsuarioComSenha,
} from '@/mocks/dados/fixtures'

export type BancoMock = {
  usuarios: UsuarioComSenha[]
  /** token -> usuarioId */
  sessoes: Record<string, string>
  nfts: Nft[]
  favoritos: Favorito[]
  /** identidade -> carrinho (identidade = usuário logado ou visitante anônimo) */
  carrinhos: Record<string, Carrinho>
  pedidos: Pedido[]
  carteiras: Carteira[]
  idempotencia: Record<string, { pedidoId: string; hash: string }>
}

const CHAVE_BANCO = 'kurio.mock.bd.v3'

function criarBancoInicial(): BancoMock {
  return {
    // structuredClone impede que mutações contaminem as fixtures originais.
    usuarios: structuredClone(usuariosIniciais),
    sessoes: {},
    nfts: structuredClone(nftsIniciais),
    favoritos: [],
    carrinhos: {},
    pedidos: [],
    carteiras: structuredClone(carteirasIniciais),
    idempotencia: {},
  }
}

let banco: BancoMock | null = null

export function obterBanco(): BancoMock {
  if (banco) return banco

  const bruto = localStorage.getItem(CHAVE_BANCO)
  if (bruto) {
    try {
      banco = JSON.parse(bruto) as BancoMock
      return banco
    } catch {
      // Banco corrompido: recomeça da fixture conhecida.
    }
  }

  banco = criarBancoInicial()
  salvarBanco()
  return banco
}

export function salvarBanco(): void {
  if (banco) localStorage.setItem(CHAVE_BANCO, JSON.stringify(banco))
}

/** Reset completo: restaura a fixture conhecida de todos os recursos. */
export function reiniciarBanco(): void {
  banco = criarBancoInicial()
  salvarBanco()
}
