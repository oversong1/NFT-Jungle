import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

import { CartaoNft, EsqueletoCartaoNft } from '@/componentes/compostos/cartao-nft'
import { Botao } from '@/componentes/ui/botao'
import { ordenacoesCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'

const nftDemonstracao = {
  nome: 'Primate Zero',
  colecao: 'Jungle Genesis',
  precoEth: '0.125',
  imagem: '/assets/nfts/arte-substituta.jpg',
  raro: true,
}

const rotulosOrdenacao: Record<(typeof ordenacoesCatalogo)[number], string> = {
  recentes: 'Mais recentes',
  'preco-crescente': 'Menor preço',
  'preco-decrescente': 'Maior preço',
  nome: 'Nome (A–Z)',
}

export function PaginaInicial() {
  const filtros = useSearch({ from: '/' })
  const navegar = useNavigate({ from: '/' })

  // Estado transitório: existe somente enquanto a pessoa digita.
  // A fonte de verdade continua sendo filtros.q, vindo da URL.
  const [buscaDigitada, definirBuscaDigitada] = useState(filtros.q ?? '')

  function aoEnviarBusca(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const valor = buscaDigitada.trim()

    void navegar({
      search: (atual: any) => ({
        ...atual,
        q: valor === '' ? undefined : valor,
        pagina: 1,
      }),
    })
  }

  function aoTrocarOrdenacao(evento: React.ChangeEvent<HTMLSelectElement>) {
    const ordenacao = evento.target.value as (typeof ordenacoesCatalogo)[number]

    void navegar({
      search: (atual: any) => ({ ...atual, ordenacao, pagina: 1 }),
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-destaque">
          Marketplace NFT
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-titulo sm:text-5xl">
          Kurio
        </h1>
      </header>

      <form
        onSubmit={aoEnviarBusca}
        className="mb-8 flex flex-wrap items-end gap-4"
        role="search"
      >
        <div className="flex min-w-56 flex-1 flex-col gap-1.5">
          <label htmlFor="campo-busca" className="text-sm font-bold text-titulo">
            Buscar NFT
          </label>
          <input
            id="campo-busca"
            type="search"
            value={buscaDigitada}
            onChange={(evento) => definirBuscaDigitada(evento.target.value)}
            placeholder="Nome ou coleção"
            className="min-h-11 rounded-full border border-[var(--cor-borda)] bg-superficie px-4 text-titulo placeholder:text-texto-suave"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="campo-ordenacao" className="text-sm font-bold text-titulo">
            Ordenar por
          </label>
          <select
            id="campo-ordenacao"
            value={filtros.ordenacao}
            onChange={aoTrocarOrdenacao}
            className="min-h-11 rounded-full border border-[var(--cor-borda)] bg-superficie px-4 text-titulo"
          >
            {ordenacoesCatalogo.map((opcao) => (
              <option key={opcao} value={opcao}>
                {rotulosOrdenacao[opcao]}
              </option>
            ))}
          </select>
        </div>

        <Botao type="submit">Aplicar busca</Botao>
      </form>

      <p className="mb-6 text-sm text-texto-suave" aria-live="polite">
        Estado atual da URL — busca: {filtros.q ?? 'nenhuma'} · categoria:{' '}
        {filtros.categoria} · rede: {filtros.rede} · raridade: {filtros.raridade} ·
        ordenação: {filtros.ordenacao} · página: {filtros.pagina}
      </p>

      <section aria-labelledby="titulo-catalogo">
        <h2 id="titulo-catalogo" className="mb-5 text-xl font-bold text-titulo">
          Catálogo (dados de demonstração)
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CartaoNft {...nftDemonstracao} />
          <EsqueletoCartaoNft />
        </div>
      </section>

      <nav aria-label="Paginação" className="mt-10 flex items-center gap-4">
        <Link
          from="/"
          search={(atual: any) => ({
            ...atual,
            pagina: Math.max(1, atual.pagina - 1),
          })}
          aria-disabled={filtros.pagina === 1}
          className="rounded-full border border-[var(--cor-borda)] px-5 py-2.5 text-sm font-bold text-titulo aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Página anterior
        </Link>
        <span className="text-sm text-texto">Página {filtros.pagina}</span>
        <Link
          from="/"
          search={(atual: any) => ({ ...atual, pagina: atual.pagina + 1 })}
          className="rounded-full border border-[var(--cor-borda)] px-5 py-2.5 text-sm font-bold text-titulo"
        >
          Próxima página
        </Link>
      </nav>
    </main>
  )
}
