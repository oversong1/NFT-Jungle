import { Heart } from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'

export type DadosCartaoNft = {
  nome: string
  colecao: string
  precoEth: string
  imagem: string
  raro?: boolean
  favorito?: boolean
}

type PropriedadesCartaoNft = DadosCartaoNft & {
  aoAlternarFavorito?: () => void
}

export function CartaoNft({
  nome,
  colecao,
  precoEth,
  imagem,
  raro = false,
  favorito = false,
  aoAlternarFavorito,
}: PropriedadesCartaoNft) {
  return (
    <article className="group overflow-hidden rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie shadow-[var(--sombra-cartao)]">
      <div className="relative aspect-square overflow-hidden bg-superficie-elevada">
        <img
          src={imagem}
          alt={`Arte do NFT ${nome}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
        />

        {raro ? (
          <span className="absolute left-3 top-3 rounded-full bg-fundo/80 px-3 py-1 text-xs font-bold text-destaque backdrop-blur-sm">
            Raro
          </span>
        ) : null}

        <Botao
          type="button"
          variante="secundaria"
          tamanho="icone"
          className="absolute right-3 top-3 rounded-full bg-fundo/80 p-0 backdrop-blur-sm"
          aria-label={favorito ? `Remover ${nome} dos favoritos` : `Favoritar ${nome}`}
          aria-pressed={favorito}
          onClick={aoAlternarFavorito}
        >
          <Heart aria-hidden="true" className={favorito ? 'fill-destaque text-destaque' : ''} size={18} />
        </Botao>
      </div>

      <div className="space-y-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-texto-suave">
          {colecao}
        </p>
        <h2 className="truncate text-base font-bold text-titulo">{nome}</h2>
        <p className="text-sm text-texto">
          <span className="sr-only">Preço: </span>
          {precoEth} ETH
        </p>
      </div>
    </article>
  )
}

export function EsqueletoCartaoNft() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie motion-reduce:animate-none"
      aria-label="Carregando NFT"
      role="status"
    >
      <div className="aspect-square bg-superficie-elevada" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-2/5 rounded bg-superficie-elevada" />
        <div className="h-5 w-4/5 rounded bg-superficie-elevada" />
        <div className="h-4 w-1/3 rounded bg-superficie-elevada" />
      </div>
      <span className="sr-only">Carregando NFT</span>
    </div>
  )
}