/** Envelope padrão de listagens paginadas. */
export type Paginacao<T> = {
  itens: T[]
  pagina: number
  porPagina: number
  total: number
  totalPaginas: number
}

/** Formato único de erro que toda a aplicação conhece. */
export type ErroApi = {
  status: number
  codigo: string
  mensagem: string
  /** Erros associados a campos de formulário, ex.: { email: 'E-mail já cadastrado' } */
  campos?: Record<string, string>
}


import type {
  categoriasCatalogo,
  raridadesCatalogo,
  redesCatalogo,
} from '@/funcionalidades/catalogo/esquema-filtros'

export type CategoriaNft = Exclude<(typeof categoriasCatalogo)[number], 'todas'>
export type RedeNft = Exclude<(typeof redesCatalogo)[number], 'todas'>
export type RaridadeNft = Exclude<(typeof raridadesCatalogo)[number], 'todas'>

export type Usuario = {
  id: string
  nome: string
  email: string
  avatarUrl: string | null
  criadoEm: string
}

export type Sessao = {
  token: string
  usuario: Usuario
}

export type Colecao = {
  id: string
  nome: string
  slug: string
}

export type Edicao = {
  total: number
  disponiveis: number
}

/**
 * Recurso que recebe eventos em tempo real: carrega id, versao e
 * data de atualização para descartar eventos atrasados (versão menor).
 */
export type Nft = {
  id: string
  versao: number
  atualizadoEm: string
  nome: string
  descricao: string
  imagem: string
  colecaoId: string
  colecaoNome: string
  categoria: CategoriaNft
  rede: RedeNft
  raridade: RaridadeNft
  /** ETH sempre como string decimal, ex.: "0.125". Nunca number. */
  precoEth: string
  edicao: Edicao
}

export type ItemCarrinho = {
  nftId: string
  /** Inteiro positivo, validado no handler. */
  quantidade: number
}

export type Carrinho = {
  id: string
  versao: number
  atualizadoEm: string
  identidade: string
  itens: ItemCarrinho[]
}

export type Cupom = {
  codigo: string
  percentual: number
  expiraEm: string
  ativo: boolean
}

export type Cotacao = {
  subtotalEth: string
  descontoEth: string
  taxaRedeEth: string
  totalEth: string
  cupomAplicado: string | null
}

export type Carteira = {
  id: string
  versao: number
  atualizadoEm: string
  usuarioId: string
  apelido: string
  endereco: string
  rede: RedeNft
  principal: boolean
}

export type StatusPedido = 'processando' | 'aprovado' | 'recusado'

/** Linha do recibo: snapshot do momento da compra. */
export type ItemRecibo = {
  nftId: string
  nome: string
  quantidade: number
  precoUnitarioEth: string
}

export type Recibo = {
  itens: ItemRecibo[]
  subtotalEth: string
  descontoEth: string
  taxaRedeEth: string
  totalEth: string
  cupomAplicado: string | null
}

export type Pedido = {
  id: string
  versao: number
  atualizadoEm: string
  usuarioId: string
  status: StatusPedido
  criadoEm: string
  recibo: Recibo
}