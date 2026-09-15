import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { SlidersHorizontal, X } from 'lucide-react'
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

export function PaginaInicial() {
  const filtros = useSearch({ from: '/' })
  const navegar = useNavigate({ from: '/' })

  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  const consulta = useCatalogo(filtros)
  const favoritos = useFavoritos(usuarioId)
  // Sem usuário a mutation nunca dispara (o clique redireciona ao login),
  // mas o hook precisa ser chamado incondicionalmente: regra dos hooks.
  const alternarFavorito = useAlternarFavorito(usuarioId ?? 'anonimo')

  const [gavetaAberta, definirGavetaAberta] = useState(false)
  // Estado transitório da busca: a verdade continua sendo filtros.q, na URL.
  const [buscaDigitada, definirBuscaDigitada] = useState(filtros.q ?? '')

  const idsFavoritos = new Set(favoritos.data ?? [])
  const chips = filtrosAtivos(filtros)

  function aplicarFiltros(novos: Partial<FiltrosCatalogo>) {
    definirGavetaAberta(false)
    // Toda mudança de filtro reinicia a paginação.
    void navegar({
      search: (atual) => ({ ...atual, ...novos, pagina: 1 }),
    })
  }

  function limparFiltros() {
    definirBuscaDigitada('')
    definirGavetaAberta(false)
    void navegar({ search: filtrosPadrao })
  }

  function aoEnviarBusca(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const valor = buscaDigitada.trim()
    aplicarFiltros({ q: valor === '' ? undefined : valor })
  }

  function aoTrocarOrdenacao(evento: ChangeEvent<HTMLSelectElement>) {
    aplicarFiltros({
      ordenacao: evento.target.value as FiltrosCatalogo['ordenacao'],
    })
  }

  function alternar(nftId: string) {
    if (!usuarioId) {
      // Favorito exige sessão: leva ao login preservando o destino completo.
      void navegar({
        to: '/entrar',
        search: { redirect: window.location.pathname + window.location.search },
      })
      return
    }
    alternarFavorito.mutate({ nftId, favorito: idsFavoritos.has(nftId) })
  }

  function irParaPagina(pagina: number) {
    void navegar({ search: (atual) => ({ ...atual, pagina }) })
  }

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-destaque">
            Marketplace NFT
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-titulo sm:text-5xl">
            Kurio
          </h1>
        </div>

        <form
          onSubmit={aoEnviarBusca}
          role="search"
          className="flex w-full max-w-md items-end gap-2"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="campo-busca" className="text-sm font-bold text-titulo">
              Buscar NFT
            </label>
            <input
              id="campo-busca"
              type="search"
              value={buscaDigitada}
              onChange={(evento) => definirBuscaDigitada(evento.target.value)}
              placeholder="Nome ou coleção"
              className="min-h-11 w-full rounded-full border border-[var(--cor-borda)] bg-superficie px-4 text-titulo placeholder:text-texto-suave"
            />
          </div>
          <Botao type="submit">Buscar</Botao>
        </form>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Botao
          type="button"
          variante="secundaria"
          tamanho="pequeno"
          className="lg:hidden"
          onClick={() => definirGavetaAberta(true)}
        >
          <SlidersHorizontal aria-hidden="true" size={16} />
          Filtros
        </Botao>

        <label htmlFor="campo-ordenacao" className="sr-only">
          Ordenar por
        </label>
        <select
          id="campo-ordenacao"
          value={filtros.ordenacao}
          onChange={aoTrocarOrdenacao}
          className="min-h-11 rounded-full border border-[var(--cor-borda)] bg-superficie px-4 text-sm text-titulo"
        >
          {ordenacoesCatalogo.map((opcao) => (
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
        <ul aria-label="Filtros ativos" className="mb-6 flex flex-wrap gap-2">
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
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--cor-borda)] bg-superficie px-3 py-1.5 text-xs font-semibold text-titulo hover:bg-superficie-elevada"
              >
                {chip.rotulo}
                <X aria-hidden="true" size={14} />
                <span className="sr-only"> — remover filtro</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Filtros do catálogo" className="hidden lg:block">
          <FormularioFiltros
            prefixoId="filtros-desktop"
            filtros={filtros}
            aoAplicar={aplicarFiltros}
            aoLimpar={limparFiltros}
          />
        </aside>

        <section aria-labelledby="titulo-catalogo">
          <h2 id="titulo-catalogo" className="sr-only">
            Resultados do catálogo
          </h2>

          {consulta.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 8 }, (_ignorado, indice) => (
                <EsqueletoCartaoNft key={indice} />
              ))}
            </div>
          ) : consulta.isError ? (
            <div
              role="alert"
              className="rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-8 text-center"
            >
              <h3 className="text-lg font-bold text-titulo">
                Não foi possível carregar o catálogo
              </h3>
              <p className="mt-2 text-sm text-texto">
                Verifique sua conexão e tente novamente.
              </p>
              <Botao
                type="button"
                className="mt-5"
                onClick={() => void consulta.refetch()}
              >
                Tentar novamente
              </Botao>
            </div>
          ) : consulta.data.itens.length === 0 ? (
            <div className="rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-8 text-center">
              <h3 className="text-lg font-bold text-titulo">Nenhum NFT encontrado</h3>
              <p className="mt-2 text-sm text-texto">
                Ajuste a busca ou remova filtros para ver mais resultados.
              </p>
              <Botao
                type="button"
                variante="secundaria"
                className="mt-5"
                onClick={limparFiltros}
              >
                Limpar filtros
              </Botao>
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${
                  consulta.isPlaceholderData ? 'opacity-60' : ''
                }`}
              >
                {consulta.data.itens.map((nft) => (
                  <Link
                    key={nft.id}
                    to="/nfts/$nftId"
                    params={{ nftId: nft.id }}
                    className="block rounded-[var(--raio-cartao)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-destaque"
                  >
                    <CartaoNft
                      nome={nft.nome}
                      colecao={nft.colecaoNome}
                      precoEth={nft.precoEth}
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
                aoMudar={irParaPagina}
              />
            </>
          )}
        </section>
      </div>

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
