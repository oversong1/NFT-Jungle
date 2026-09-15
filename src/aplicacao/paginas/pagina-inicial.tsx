import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'

import { CartaoNft, EsqueletoCartaoNft } from '@/componentes/compostos/cartao-nft'
import { Paginacao } from '@/componentes/compostos/paginacao'
import { Botao } from '@/componentes/ui/botao'
import {
  filtrosPadrao,
  ordenacoesCatalogo,
  type FiltrosCatalogo,
} from '@/funcionalidades/catalogo/esquema-filtros'
import { filtrosAtivos } from '@/funcionalidades/catalogo/filtros-ativos'
import { FormularioFiltros } from '@/funcionalidades/catalogo/formulario-filtros'
import { GavetaFiltros } from '@/funcionalidades/catalogo/gaveta-filtros'
import { rotulosOrdenacao } from '@/funcionalidades/catalogo/rotulos'
import { useCatalogo } from '@/funcionalidades/catalogo/usar-catalogo'
import {
  useAlternarFavorito,
  useFavoritos,
} from '@/funcionalidades/catalogo/usar-favoritos'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'

const destaques = [
  {
    imagem: '/assets/nfts/primate-01.jpg',
    titulo: 'Lançamentos gênesis de edição limitada',
    texto:
      'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
  },
  {
    imagem: '/assets/nfts/primate-03.jpg',
    titulo: 'Arte digital selecionada e muito mais',
    texto:
      'Explore novas artistas, coleções verificadas e obras digitais que definem o futuro.',
  },
]

const diario = [
  [
    'primate-03.jpg',
    'Como funciona a propriedade de NFTs',
    '12 de setembro · Leitura de 6 min',
  ],
  [
    'primate-01.jpg',
    '10 artistas digitais para acompanhar',
    '13 de setembro · Leitura de 2 min',
  ],
  [
    'primate-02.jpg',
    'Raridade, atributos e procedência',
    '15 de setembro · Leitura de 3 min',
  ],
  ['primate-04.jpg', 'Como proteger sua carteira', '15 de setembro · Leitura de 2 min'],
]

export function PaginaInicial() {
  const filtros = useSearch({ from: '/' })
  const navegar = useNavigate({ from: '/' })
  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id
  const consulta = useCatalogo(filtros)
  const favoritos = useFavoritos(usuarioId)
  const alternarFavorito = useAlternarFavorito(usuarioId ?? 'anonimo')
  const [gavetaAberta, definirGavetaAberta] = useState(false)
  const [buscaDigitada, definirBuscaDigitada] = useState(filtros.q ?? '')
  const idsFavoritos = new Set(favoritos.data ?? [])
  const chips = filtrosAtivos(filtros)

  function aplicarFiltros(novos: Partial<FiltrosCatalogo>) {
    definirGavetaAberta(false)
    void navegar({ search: (atual) => ({ ...atual, ...novos, pagina: 1 }) })
  }
  function limparFiltros() {
    definirBuscaDigitada('')
    definirGavetaAberta(false)
    void navegar({ search: filtrosPadrao })
  }
  function aoEnviarBusca(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    aplicarFiltros({ q: buscaDigitada.trim() || undefined })
  }
  function aoTrocarOrdenacao(evento: ChangeEvent<HTMLSelectElement>) {
    aplicarFiltros({ ordenacao: evento.target.value as FiltrosCatalogo['ordenacao'] })
  }
  function alternar(nftId: string) {
    if (!usuarioId) {
      void navegar({
        to: '/entrar',
        search: { redirect: window.location.pathname + window.location.search },
      })
      return
    }
    alternarFavorito.mutate({ nftId, favorito: idsFavoritos.has(nftId) })
  }

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="grid min-h-[350px] items-center gap-8 py-8 lg:grid-cols-[1.2fr_.8fr] lg:py-12">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold tracking-[.18em] text-[#e1ccb2]">
            Bem-vindo à Kurio
          </p>
          <h1 className="mt-3 max-w-lg text-3xl font-black leading-[1.3] tracking-wide text-titulo sm:text-5xl">
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h1>
          <p className="mt-4 max-w-md text-xs leading-5 text-[#c7a77f]">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione
            arte digital rara, apoie artistas e tenha uma parte do futuro cultural da
            internet.
          </p>
          <Botao comoFilho className="mt-5 min-h-8 rounded-[3px] px-5 py-1.5 text-[10px]">
            <a href="#mercado">EXPLORAR</a>
          </Botao>
        </div>
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl bg-[#e9ead6] shadow-[0_18px_60px_rgb(0_0_0_/_30%)]">
          <img
            src="/assets/nfts/primate-01.jpg"
            alt="NFT em destaque, primata com jaqueta verde"
            className="aspect-[1.18] w-full object-cover"
          />
        </div>
      </section>

      <section
        id="mercado"
        className="grid gap-6 pb-12 lg:grid-cols-[minmax(16rem,17.5rem)_minmax(0,1fr)] xl:gap-8"
      >
        <aside aria-label="Filtros do catálogo" className="hidden space-y-4 lg:block">
          <div className="bg-[#251611] p-5">
            <FormularioFiltros
              prefixoId="filtros-desktop"
              filtros={filtros}
              aoAplicar={aplicarFiltros}
              aoLimpar={limparFiltros}
            />
          </div>
          <article className="overflow-hidden bg-[#251611] text-center">
            <p className="bg-[#3b210f] py-2 text-xs font-black uppercase tracking-[0.14em] text-acao">
              NFT em destaque
            </p>
            <p className="px-3 pt-3 text-sm font-black text-titulo">OFERTA LIMITADA</p>
            <img
              src="/assets/nfts/primate-02.jpg"
              alt="NFT em destaque"
              className="mt-3 aspect-square w-full object-cover"
            />
            <div className="p-4 text-left">
              <p className="text-sm font-bold text-titulo">Cosmic Bloom #118</p>
              <p className="mt-1 text-sm font-black text-acao">1.29 ETH</p>
              <Link
                to="/nfts/$nftId"
                params={{ nftId: 'nft-02' }}
                className="mt-3 inline-flex border border-acao px-3 py-1.5 text-[10px] font-bold text-acao hover:bg-acao hover:text-fundo"
              >
                Ver NFT
              </Link>
            </div>
          </article>
        </aside>
        <section aria-labelledby="titulo-catalogo">
          <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[#54321e] pb-3">
            <div className="flex gap-3 text-[10px] font-bold text-[#c7a77f]">
              <span className="border-b border-acao pb-3 -mb-[13px] text-acao">
                Todos os NFTs
              </span>
              <span>Novos lançamentos</span>
              <span>Em alta</span>
            </div>
            <form
              onSubmit={aoEnviarBusca}
              role="search"
              className="ml-auto flex min-w-[11rem] gap-1"
            >
              <label className="sr-only" htmlFor="campo-busca">
                Buscar NFT
              </label>
              <input
                id="campo-busca"
                type="search"
                value={buscaDigitada}
                onChange={(evento) => definirBuscaDigitada(evento.target.value)}
                placeholder="Buscar..."
                className="min-w-0 flex-1 border border-[#57341f] bg-transparent px-2 py-1 text-[10px] text-titulo placeholder:text-[#a98057]"
              />
              <button
                type="submit"
                className="border border-acao px-2 text-[10px] text-acao"
              >
                Ir
              </button>
            </form>
            <Botao
              type="button"
              variante="secundaria"
              tamanho="pequeno"
              className="lg:hidden"
              onClick={() => definirGavetaAberta(true)}
            >
              <SlidersHorizontal size={14} />
              Filtros
            </Botao>
            <select
              value={filtros.ordenacao}
              onChange={aoTrocarOrdenacao}
              aria-label="Ordenar resultados"
              className="border-0 bg-transparent text-[10px] text-[#dfd0bf] outline-none"
            >
              <option value="recentes">Ordenar por: Listados recentemente</option>
              {ordenacoesCatalogo
                .filter((opcao) => opcao !== 'recentes')
                .map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {rotulosOrdenacao[opcao]}
                  </option>
                ))}
            </select>

            {consulta.isFetching && !consulta.isPending ? (
              <p className="text-xs text-texto-suave" role="status">
                Atualizando resultados…
              </p>
            ) : null}
          </div>
          {chips.length > 0 ? (
            <ul className="mb-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.chave}>
                  <button
                    type="button"
                    onClick={() => {
                      if (chip.chave === 'q') definirBuscaDigitada('')
                      aplicarFiltros({
                        [chip.chave]: filtrosPadrao[chip.chave],
                      } as Partial<FiltrosCatalogo>)
                    }}
                    className="flex items-center gap-1 border border-[#724526] px-2 py-1 text-[10px] text-acao"
                  >
                    {chip.rotulo}
                    <X size={11} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {consulta.isPending ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 8 }, (_, indice) => (
                <EsqueletoCartaoNft key={indice} />
              ))}
            </div>
          ) : consulta.isError ? (
            <div className="py-12 text-center text-sm text-texto">
              Não foi possível carregar o catálogo.
              <Botao
                type="button"
                className="ml-3"
                tamanho="pequeno"
                onClick={() => void consulta.refetch()}
              >
                Tentar novamente
              </Botao>
            </div>
          ) : consulta.data.itens.length === 0 ? (
            <div className="py-12 text-center text-sm text-texto">
              Nenhum NFT encontrado.
              <Botao
                type="button"
                className="ml-3"
                tamanho="pequeno"
                onClick={limparFiltros}
              >
                Limpar filtros
              </Botao>
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${consulta.isPlaceholderData ? 'opacity-60' : ''}`}
              >
                {consulta.data.itens.map((nft) => (
                  <Link
                    key={nft.id}
                    to="/nfts/$nftId"
                    params={{ nftId: nft.id }}
                    className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-destaque"
                  >
                    <CartaoNft
                      nome={nft.nome}
                      colecao={nft.colecaoNome}
                      precoEth={nft.precoEth}
                      precoAnteriorEth={
                        nft.nome === 'Neon Vessel #552' ? '2.29' : undefined
                      }
                      imagem={nft.imagem}
                      raro={nft.raridade !== 'comum'}
                      favorito={idsFavoritos.has(nft.id)}
                      aoAlternarFavorito={() => alternar(nft.id)}
                    />
                  </Link>
                ))}
              </div>
              <Paginacao
                pagina={consulta.data.pagina}
                totalPaginas={consulta.data.totalPaginas}
                aoMudar={(pagina) =>
                  void navegar({ search: (atual) => ({ ...atual, pagina }) })
                }
              />
            </>
          )}
        </section>
      </section>

      <section className="grid gap-4 py-5 sm:grid-cols-2">
        {destaques.map((destaque) => (
          <article
            key={destaque.titulo}
            className="grid grid-cols-[.8fr_1fr] overflow-hidden bg-[#2a1812]"
          >
            <img
              src={destaque.imagem}
              alt=""
              className="h-full min-h-35 w-full object-cover"
            />
            <div className="flex flex-col justify-center p-5 text-right">
              <h2 className="text-sm font-black leading-4 text-titulo">
                {destaque.titulo}
              </h2>
              <p className="mt-2 text-[10px] leading-4 text-[#c7a77f]">
                {destaque.texto}
              </p>
              <span className="mt-3 inline-flex items-center justify-end gap-1 text-[10px] font-bold text-acao">
                Explorar <ArrowRight size={12} />
              </span>
            </div>
          </article>
        ))}
      </section>
      <section className="py-10">
        <h2 className="text-center text-xl font-black text-titulo">Diário da Cunhagem</h2>
        <p className="mt-1 text-center text-[10px] text-[#c7a77f]">
          Histórias, guias e insights para colecionadores e criadores do universo da
          propriedade digital.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {diario.map(([imagem, titulo, meta]) => (
            <article key={titulo} className="bg-[#2a1812] p-2">
              <img
                src={`/assets/nfts/${imagem}`}
                alt=""
                className="aspect-[1.25] w-full object-cover"
              />
              <p className="mt-2 text-[8px] text-[#bd9366]">{meta}</p>
              <h3 className="mt-1 text-[11px] font-bold text-titulo">{titulo}</h3>
              <p className="mt-1 text-[9px] text-[#c7a77f]">
                Acompanhe histórias de artistas, tecnologia e colecionismo digital.
              </p>
            </article>
          ))}
        </div>
      </section>
      <GavetaFiltros aberta={gavetaAberta} aoFechar={() => definirGavetaAberta(false)}>
        <FormularioFiltros
          prefixoId="filtros-gaveta"
          filtros={filtros}
          aoAplicar={aplicarFiltros}
          aoLimpar={limparFiltros}
        />
      </GavetaFiltros>
    </main>
  )
}
