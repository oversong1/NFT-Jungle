import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Heart, Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { CartaoNft } from '@/componentes/compostos/cartao-nft'
import { Botao } from '@/componentes/ui/botao'
import { useDefinirItemCarrinho } from '@/funcionalidades/carrinho/usar-carrinho'
import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'
import {
  rotulosCategoria,
  rotulosRaridade,
  rotulosRede,
} from '@/funcionalidades/catalogo/rotulos'
import { useCatalogo, useNft } from '@/funcionalidades/catalogo/usar-catalogo'
import {
  useAlternarFavorito,
  useFavoritos,
} from '@/funcionalidades/catalogo/usar-favoritos'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'
import type { ErroApi } from '@/tipos/api'

const abas = ['descricao', 'detalhes'] as const

type Aba = (typeof abas)[number]

const rotulosAba: Record<Aba, string> = {
  descricao: 'Descrição',
  detalhes: 'Detalhes',
}

export function PaginaDetalheNft() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const navegar = useNavigate()

  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  const consulta = useNft(nftId)
  const relacionados = useCatalogo(filtrosPadrao)
  const favoritos = useFavoritos(usuarioId)
  const alternarFavorito = useAlternarFavorito(usuarioId ?? 'anonimo')

  const [quantidade, definirQuantidade] = useState(1)
  const [mensagem, definirMensagem] = useState('')
  const [abaAtiva, definirAbaAtiva] = useState<Aba>('descricao')

  const incluirNoCarrinho = useDefinirItemCarrinho()

  if (consulta.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        aria-busy="true"
      >
        <div className="grid animate-pulse grid-cols-1 gap-10 lg:grid-cols-2 motion-reduce:animate-none">
          <div className="aspect-square bg-[#271712]" />
          <div className="space-y-4">
            <div className="h-4 w-1/3 bg-[#271712]" />
            <div className="h-8 w-2/3 bg-[#271712]" />
            <div className="h-5 w-1/4 bg-[#271712]" />
            <div className="h-24 bg-[#271712]" />
          </div>
        </div>
        <span className="sr-only">Carregando NFT</span>
      </main>
    )
  }

  if (consulta.isError) {
    const erroApi = consulta.error as unknown as ErroApi

    if (erroApi.status === 404) {
      return (
        <main
          id="conteudo"
          tabIndex={-1}
          className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
        >
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-destaque">
            Erro 404
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-titulo">
            NFT não encontrado
          </h1>
          <p className="mt-4 text-texto">
            Este NFT não existe ou foi removido do catálogo.
          </p>
          <Botao comoFilho className="mt-8">
            <Link to="/" search={filtrosPadrao}>
              Voltar ao catálogo
            </Link>
          </Botao>
        </main>
      )
    }

    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
        role="alert"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          Erro ao carregar o NFT
        </h1>
        <p className="mt-4 text-texto">{erroApi.mensagem}</p>
        <Botao type="button" className="mt-8" onClick={() => void consulta.refetch()}>
          Tentar novamente
        </Botao>
      </main>
    )
  }

  const nft = consulta.data
  const esgotado = nft.edicao.disponiveis <= 0
  const quantidadeMaxima = Math.max(1, nft.edicao.disponiveis)
  const idsFavoritos = new Set(favoritos.data ?? [])
  const favorito = idsFavoritos.has(nft.id)

  const listaRelacionados = (relacionados.data?.itens ?? [])
    .filter((item) => item.id !== nft.id)
    .sort(
      (a, b) =>
        Number(b.colecaoId === nft.colecaoId) - Number(a.colecaoId === nft.colecaoId),
    )
    .slice(0, 4)

  function alternarFavoritoDe(id: string, jaFavorito: boolean) {
    if (!usuarioId) {
      void navegar({ to: '/entrar', search: { redirect: `/nfts/${nft.id}` } })
      return
    }
    alternarFavorito.mutate({ nftId: id, favorito: jaFavorito })
  }

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <nav
        aria-label="Trilha de navegação"
        className="mb-6 text-[11px] font-bold text-[#c7a77f]"
      >
        <Link to="/" search={filtrosPadrao} className="hover:text-titulo">
          Início
        </Link>
        <span aria-hidden="true"> / </span>
        <Link to="/" search={filtrosPadrao} className="hover:text-titulo">
          Mercado
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-acao">{nft.nome}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <section
          aria-label={`Miniaturas do NFT ${nft.nome}`}
          className="order-2 flex gap-3 lg:order-1 lg:flex-col"
        >
          {Array.from({ length: 3 }, (_, indice) => (
            <div
              key={indice}
              aria-hidden={indice > 0}
              className={`aspect-square w-16 overflow-hidden bg-[#271712] p-1 lg:w-full ${
                indice === 0 ? 'outline outline-1 outline-acao' : 'opacity-60'
              }`}
            >
              <img
                src={nft.imagem}
                alt={indice === 0 ? `Miniatura do NFT ${nft.nome}` : ''}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </section>

        <section aria-label={`Imagem do NFT ${nft.nome}`} className="order-1 lg:order-2">
          <div className="aspect-square overflow-hidden bg-[#271712] p-2">
            <img
              src={nft.imagem}
              alt={`Arte do NFT ${nft.nome}`}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section
          aria-label={`Informações do NFT ${nft.nome}`}
          className="order-3 space-y-5"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-acao">
              {nft.colecaoNome}
            </p>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-wide text-titulo sm:text-3xl">
              {nft.nome}
            </h1>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-[#54321e] bg-[#271712] p-3">
              <dt className="text-[10px] uppercase tracking-wide text-[#c7a77f]">
                Categoria
              </dt>
              <dd className="mt-0.5 font-bold text-titulo">
                {rotulosCategoria[nft.categoria]}
              </dd>
            </div>
            <div className="border border-[#54321e] bg-[#271712] p-3">
              <dt className="text-[10px] uppercase tracking-wide text-[#c7a77f]">Rede</dt>
              <dd className="mt-0.5 font-bold text-titulo">{rotulosRede[nft.rede]}</dd>
            </div>
            <div className="border border-[#54321e] bg-[#271712] p-3">
              <dt className="text-[10px] uppercase tracking-wide text-[#c7a77f]">
                Raridade
              </dt>
              <dd className="mt-0.5 font-bold text-acao">
                {rotulosRaridade[nft.raridade]}
              </dd>
            </div>
            <div className="border border-[#54321e] bg-[#271712] p-3">
              <dt className="text-[10px] uppercase tracking-wide text-[#c7a77f]">
                Edições
              </dt>
              <dd
                className={`mt-0.5 font-bold ${esgotado ? 'text-erro' : 'text-sucesso'}`}
              >
                {esgotado
                  ? 'Esgotado'
                  : `${nft.edicao.disponiveis} de ${nft.edicao.total} disponíveis`}
              </dd>
            </div>
          </dl>

          <p className="text-2xl font-black text-acao">
            <span className="sr-only">Preço: </span>
            {nft.precoEth} ETH
          </p>

          {!esgotado ? (
            <div className="flex flex-wrap items-center gap-3">
              <span
                id="rotulo-quantidade"
                className="text-xs font-bold uppercase tracking-wide text-titulo"
              >
                Quantidade
              </span>
              <div
                role="group"
                aria-labelledby="rotulo-quantidade"
                className="flex items-center border border-[#54321e] bg-[#271712]"
              >
                <Botao
                  type="button"
                  variante="texto"
                  tamanho="icone"
                  aria-label="Diminuir quantidade"
                  disabled={quantidade <= 1}
                  onClick={() => definirQuantidade((atual) => Math.max(1, atual - 1))}
                >
                  <Minus aria-hidden="true" size={16} />
                </Botao>
                <output
                  aria-live="polite"
                  className="min-w-8 text-center font-bold text-titulo"
                >
                  {quantidade}
                </output>
                <Botao
                  type="button"
                  variante="texto"
                  tamanho="icone"
                  aria-label="Aumentar quantidade"
                  disabled={quantidade >= quantidadeMaxima}
                  onClick={() =>
                    definirQuantidade((atual) => Math.min(quantidadeMaxima, atual + 1))
                  }
                >
                  <Plus aria-hidden="true" size={16} />
                </Botao>
              </div>
              <p className="text-[10px] text-[#c7a77f]">
                Máximo: {quantidadeMaxima} unidades
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Botao
              type="button"
              className="w-full rounded-none sm:flex-1"
              disabled={esgotado || incluirNoCarrinho.isPending}
              onClick={() =>
                incluirNoCarrinho.mutate(
                  { nftId, quantidade },
                  {
                    onSuccess: () => definirMensagem('Item incluído no carrinho.'),
                    // O interceptor normaliza toda falha para o formato ErroApi.
                    onError: (erro) =>
                      definirMensagem((erro as unknown as ErroApi).mensagem),
                  },
                )
              }
            >
              {esgotado
                ? 'Indisponível'
                : incluirNoCarrinho.isPending
                  ? 'Incluindo…'
                  : 'Incluir no carrinho'}
            </Botao>
            <Botao
              type="button"
              variante="secundaria"
              className="w-full rounded-none border-[#54321e] sm:flex-1"
              aria-pressed={favorito}
              onClick={() => alternarFavoritoDe(nft.id, favorito)}
            >
              <Heart
                aria-hidden="true"
                size={18}
                className={favorito ? 'fill-destaque text-destaque' : ''}
              />
              {favorito ? 'Favoritado' : 'Favoritar'}
            </Botao>
          </div>

          <p role="status" aria-live="polite" className="min-h-5 text-sm text-texto">
            {mensagem}
          </p>

          <section aria-label="Mais informações do NFT">
            <div
              role="tablist"
              aria-label="Informações adicionais"
              className="flex gap-5 border-b border-[#54321e]"
            >
              {abas.map((aba) => (
                <button
                  key={aba}
                  type="button"
                  role="tab"
                  id={`aba-${aba}`}
                  aria-selected={abaAtiva === aba}
                  aria-controls={`painel-${aba}`}
                  onClick={() => definirAbaAtiva(aba)}
                  className={`-mb-px border-b-2 pb-2 text-xs font-bold uppercase tracking-wide ${
                    abaAtiva === aba
                      ? 'border-acao text-acao'
                      : 'border-transparent text-[#c7a77f] hover:text-titulo'
                  }`}
                >
                  {rotulosAba[aba]}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id="painel-descricao"
              aria-labelledby="aba-descricao"
              hidden={abaAtiva !== 'descricao'}
              className="pt-4 text-sm leading-6 text-texto"
            >
              {nft.descricao}
            </div>

            <div
              role="tabpanel"
              id="painel-detalhes"
              aria-labelledby="aba-detalhes"
              hidden={abaAtiva !== 'detalhes'}
              className="pt-4"
            >
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#c7a77f]">Coleção</dt>
                  <dd className="font-bold text-titulo">{nft.colecaoNome}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#c7a77f]">Identificador</dt>
                  <dd className="break-all font-bold text-titulo">{nft.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#c7a77f]">Rede</dt>
                  <dd className="font-bold text-titulo">{rotulosRede[nft.rede]}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#c7a77f]">Edição total</dt>
                  <dd className="font-bold text-titulo">{nft.edicao.total} unidades</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#c7a77f]">Atualizado em</dt>
                  <dd className="font-bold text-titulo">
                    {new Date(nft.atualizadoEm).toLocaleString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </section>
      </div>

      {listaRelacionados.length > 0 ? (
        <section aria-labelledby="titulo-colecao" className="mt-14">
          <div className="flex items-center justify-between border-b border-[#54321e] pb-3">
            <h2
              id="titulo-colecao"
              className="text-sm font-black uppercase tracking-wide text-titulo"
            >
              Mais desta coleção
            </h2>
            <Link
              to="/"
              search={filtrosPadrao}
              className="text-[10px] font-bold uppercase tracking-wide text-acao hover:text-titulo"
            >
              Ver catálogo
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {listaRelacionados.map((item) => (
              <Link
                key={item.id}
                to="/nfts/$nftId"
                params={{ nftId: item.id }}
                className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-destaque"
              >
                <CartaoNft
                  nome={item.nome}
                  colecao={item.colecaoNome}
                  precoEth={item.precoEth}
                  imagem={item.imagem}
                  raro={item.raridade !== 'comum'}
                  favorito={idsFavoritos.has(item.id)}
                  aoAlternarFavorito={() =>
                    alternarFavoritoDe(item.id, idsFavoritos.has(item.id))
                  }
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
