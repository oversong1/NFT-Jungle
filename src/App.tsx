import { CartaoNft, EsqueletoCartaoNft } from '@/componentes/compostos/cartao-nft'
import { Botao } from '@/componentes/ui/botao'

const nftDemonstracao = {
  nome: 'Primate Zero',
  colecao: 'Jungle Genesis',
  precoEth: '0.125',
  imagem: '/assets/nfts/arte-substituta.jpg',
  raro: true,
}

export default function App() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-destaque">
            Marketplace NFT
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-titulo sm:text-5xl">
            Kurio
          </h1>
        </div>
        <Botao type="button">Explorar</Botao>
      </header>

      <section aria-labelledby="titulo-fundacao">
        <h2 id="titulo-fundacao" className="mb-5 text-xl font-bold text-titulo">
          Componentes da fundação
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CartaoNft {...nftDemonstracao} />
          <EsqueletoCartaoNft />
        </div>
      </section>
    </main>
  )
}