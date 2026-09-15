import { Heart, Search, ShoppingCart } from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'

export type DadosCartaoNft = {
  nome: string
  colecao: string
  precoEth: string
  precoAnteriorEth?: string
  imagem: string
  raro?: boolean
  favorito?: boolean
}

type PropriedadesCartaoNft = DadosCartaoNft & { aoAlternarFavorito?: () => void }

export function CartaoNft({
  nome,
  colecao,
  precoEth,
  precoAnteriorEth,
  imagem,
  raro = false,
  favorito = false,
  aoAlternarFavorito,
}: PropriedadesCartaoNft) {
  return (
    <article className="group relative isolate bg-[#271712] p-2 [contain:paint] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[.96] overflow-hidden bg-[#332018] [contain:paint]">
        <img
          src={imagem}
          alt={`Arte do NFT ${nome}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        {raro ? (
          <span className="absolute left-0 top-0 bg-acao px-3 py-1.5 text-[10px] font-black uppercase text-[#160d09]">
            Raro
          </span>
        ) : null}
        <div className="absolute bottom-2 right-2 hidden gap-1 group-hover:flex">
          <span className="grid h-7 w-7 place-items-center bg-[#271712] text-titulo">
            <ShoppingCart size={15} />
          </span>
          <Botao
            type="button"
            variante="secundaria"
            tamanho="icone"
            className="h-7 min-h-7 min-w-7 rounded-none border-[#68452c] bg-[#271712] p-0"
            aria-label={favorito ? `Remover ${nome} dos favoritos` : `Favoritar ${nome}`}
            aria-pressed={favorito}
            onClick={aoAlternarFavorito}
          >
            <Heart
              aria-hidden="true"
              size={15}
              className={favorito ? 'fill-destaque text-destaque' : ''}
            />
          </Botao>
          <span className="grid h-7 w-7 place-items-center bg-[#271712] text-titulo">
            <Search size={15} />
          </span>
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] font-medium text-[#e8dfd5]">{nome}</p>
      <p className="mt-0.5 text-[11px] font-bold text-acao">
        {precoEth} ETH
        {precoAnteriorEth ? (
          <span className="ml-1 font-medium text-[#a98057] line-through">
            {precoAnteriorEth} ETH
          </span>
        ) : null}
        {colecao ? <span className="sr-only">— {colecao}</span> : null}
      </p>
    </article>
  )
}

export function EsqueletoCartaoNft() {
  return (
    <div
      className="isolate bg-[#271712] p-2 [contain:paint]"
      aria-label="Carregando NFT"
      role="status"
    >
      <div className="aspect-[.96] brilho-carregamento" />
      <div className="mt-3 h-3 w-3/5 brilho-carregamento" />
      <div className="mt-2 h-3 w-1/3 brilho-carregamento" />
      <span className="sr-only">Carregando NFT</span>
    </div>
  )
}
