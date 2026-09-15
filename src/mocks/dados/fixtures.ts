import type {
  Carteira,
  CategoriaNft,
  Colecao,
  Cupom,
  Nft,
  RaridadeNft,
  RedeNft,
  Usuario,
} from '@/tipos/dominio'

/** Somente os mocks conhecem senha. O transporte usa Usuario, sem senha. */
export type UsuarioComSenha = Usuario & { senha: string }

const DATA_BASE = '2026-02-01T12:00:00.000Z'

export const usuariosIniciais: UsuarioComSenha[] = [
  {
    id: 'usu-1',
    nome: 'Aline Souza',
    email: 'aline@kurio.dev',
    senha: 'Kurio@123',
    avatarUrl: null,
    criadoEm: '2026-01-10T12:00:00.000Z',
  },
  {
    id: 'usu-2',
    nome: 'Bruno Lima',
    email: 'bruno@kurio.dev',
    senha: 'Kurio@123',
    avatarUrl: null,
    criadoEm: '2026-01-15T12:00:00.000Z',
  },
]

export const colecoesIniciais: Colecao[] = [
  { id: 'col-1', nome: 'Jungle Genesis', slug: 'jungle-genesis' },
  { id: 'col-2', nome: 'Neon Primatas', slug: 'neon-primatas' },
]

const categorias: CategoriaNft[] = ['arte', 'colecionaveis', 'fotografia', 'musica']
const redes: RedeNft[] = ['ethereum', 'polygon', 'arbitrum']
const raridades: RaridadeNft[] = ['comum', 'raro', 'epico', 'lendario']

const obrasCatalogo = [
  { nome: 'Emerald Ape #042', precoEth: '1.19', imagem: '/assets/nfts/emerald-ape.jpg' },
  { nome: 'Sage Nomad #009', precoEth: '1.69', imagem: '/assets/nfts/sage-nomad.jpg' },
  { nome: 'Neon Vessel #552', precoEth: '1.99', imagem: '/assets/nfts/neon-vessel.jpg' },
  { nome: 'Cosmic Bloom #118', precoEth: '1.29', imagem: '/assets/nfts/emerald-ape.jpg' },
  { nome: 'Violet Nomad #314', precoEth: '1.39', imagem: '/assets/nfts/sage-nomad.jpg' },
  { nome: 'Ivory Baron #088', precoEth: '1.79', imagem: '/assets/nfts/neon-vessel.jpg' },
] as const

/**
 * 24 NFTs gerados de forma determinística: mesmos ids, preços e
 * atributos em toda máquina e a cada reset. Preço calculado com
 * Decimal — nunca com number — e transportado como string.
 */
export const nftsIniciais: Nft[] = Array.from({ length: 24 }, (_, indice) => {
  const numero = indice + 1
  const identificador = String(numero).padStart(2, '0')
  const colecao = numero <= 12 ? colecoesIniciais[0] : colecoesIniciais[1]
  const obra = obrasCatalogo[indice % obrasCatalogo.length]

  return {
    id: `nft-${identificador}`,
    versao: 1,
    atualizadoEm: DATA_BASE,
    nome: obra.nome,
    descricao: `${obra.nome} é uma obra da coleção ${colecao.nome}, cunhada na rede ${redes[indice % 3]}.`,
    imagem: obra.imagem,
    colecaoId: colecao.id,
    colecaoNome: colecao.nome,
    categoria: categorias[indice % 4],
    rede: redes[indice % 3],
    raridade: raridades[indice % 4],
    precoEth: obra.precoEth,
    edicao: {
      total: 50,
      // O NFT 07 nasce esgotado: caso obrigatório do desafio.
      disponiveis: numero === 7 ? 0 : 50 - (indice % 5),
    },
  }
})

export const cuponsIniciais: Cupom[] = [
  {
    codigo: 'KURIO10',
    percentual: 10,
    expiraEm: '2027-12-31T23:59:59.000Z',
    ativo: true,
  },
  {
    codigo: 'EXPIRADO10',
    percentual: 10,
    expiraEm: '2025-12-31T23:59:59.000Z',
    ativo: true,
  },
  {
    codigo: 'DESATIVADO20',
    percentual: 20,
    expiraEm: '2027-12-31T23:59:59.000Z',
    ativo: false,
  },
]

export const carteirasIniciais: Carteira[] = [
  {
    id: 'car-1',
    versao: 1,
    atualizadoEm: DATA_BASE,
    usuarioId: 'usu-1',
    apelido: 'Carteira principal',
    endereco: '0x8a3f1c92e4b7d605a1f28c9b30d47e6512f0aa91',
    rede: 'ethereum',
    principal: true,
  },
]
