import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Heart, Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { Botao } from '@/componentes/ui/botao'
import { useDefinirItemCarrinho } from '@/funcionalidades/carrinho/usar-carrinho'
import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'
import {
  rotulosCategoria,
  rotulosRaridade,
  rotulosRede,
} from '@/funcionalidades/catalogo/rotulos'
import { useNft } from '@/funcionalidades/catalogo/usar-catalogo'
import {
  useAlternarFavorito,
  useFavoritos,
} from '@/funcionalidades/catalogo/usar-favoritos'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'
import type { ErroApi } from '@/tipos/api'

export function PaginaDetalheNft() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const navegar = useNavigate()

  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  const consulta = useNft(nftId)
  const favoritos = useFavoritos(usuarioId)
  const alternarFavorito = useAlternarFavorito(usuarioId ?? 'anonimo')

  const [quantidade, definirQuantidade] = useState(1)
  const [mensagem, definirMensagem] = useState('')

  const incluirNoCarrinho = useDefinirItemCarrinho()

  if (consulta.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
        aria-busy="true"
      >
        <div className="grid animate-pulse grid-cols-1 gap-10 md:grid-cols-2 motion-reduce:animate-none">
          <div className="aspect-square rounded-[var(--raio-cartao)] bg-superficie-elevada" />
          <div className="space-y-4">
            <div className="h-4 w-1/3 rounded bg-superficie-elevada" />
            <div className="h-8 w-2/3 rounded bg-superficie-elevada" />
            <div className="h-5 w-1/4 rounded bg-superficie-elevada" />
            <div className="h-24 rounded bg-superficie-elevada" />
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
  const favorito = (favoritos.data ?? []).includes(nft.id)

  function alternar() {
    if (!usuarioId) {
      void navegar({ to: '/entrar', search: { redirect: `/nfts/${nft.id}` } })
      return
    }
    alternarFavorito.mutate({ nftId: nft.id, favorito })
  }

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav aria-label="Trilha de navegação" className="mb-6 text-sm text-texto-suave">
        <Link to="/" search={filtrosPadrao} className="hover:text-titulo">
          Catálogo
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-titulo">{nft.nome}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <section aria-label={`Imagem do NFT ${nft.nome}`}>
          <div className="aspect-square overflow-hidden rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie-elevada">
            <img
              src={nft.imagem}
              alt={`Arte do NFT ${nft.nome}`}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section aria-label={`Informações do NFT ${nft.nome}`} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-texto-suave">
              {nft.colecaoNome}
            </p>
            <h1 className="mt-1 text-3xl font-black text-titulo">{nft.nome}</h1>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-[var(--cor-borda)] bg-superficie p-3">
              <dt className="text-texto-suave">Categoria</dt>
              <dd className="font-bold text-titulo">{rotulosCategoria[nft.categoria]}</dd>
            </div>
            <div className="rounded-lg border border-[var(--cor-borda)] bg-superficie p-3">
              <dt className="text-texto-suave">Rede</dt>
              <dd className="font-bold text-titulo">{rotulosRede[nft.rede]}</dd>
            </div>
            <div className="rounded-lg border border-[var(--cor-borda)] bg-superficie p-3">
              <dt className="text-texto-suave">Raridade</dt>
              <dd className="font-bold text-titulo">{rotulosRaridade[nft.raridade]}</dd>
            </div>
            <div className="rounded-lg border border-[var(--cor-borda)] bg-superficie p-3">
              <dt className="text-texto-suave">Disponibilidade</dt>
              <dd className={`font-bold ${esgotado ? 'text-erro' : 'text-sucesso'}`}>
                {esgotado
                  ? 'Esgotado'
                  : `${nft.edicao.disponiveis} de ${nft.edicao.total} unidades`}
              </dd>
            </div>
          </dl>

          <p className="text-texto">{nft.descricao}</p>

          <p className="text-2xl font-black text-titulo">
            <span className="sr-only">Preço: </span>
            {nft.precoEth} ETH
          </p>

          {!esgotado ? (
            <div className="flex items-center gap-3">
              <span id="rotulo-quantidade" className="text-sm font-bold text-titulo">
                Quantidade
              </span>
              <div
                role="group"
                aria-labelledby="rotulo-quantidade"
                className="flex items-center rounded-full border border-[var(--cor-borda)]"
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
              <p className="text-xs text-texto-suave">
                Máximo: {quantidadeMaxima} unidades
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Botao
              type="button"
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
              aria-pressed={favorito}
              onClick={alternar}
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
        </section>
      </div>
    </main>
  )
}
