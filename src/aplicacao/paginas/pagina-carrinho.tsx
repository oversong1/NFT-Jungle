import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { ethSaoIguais, formatarEth, multiplicarEth } from '@/biblioteca/dinheiro'
import { Botao } from '@/componentes/ui/botao'
import {
  useCarrinho,
  useCotacao,
  useDefinirItemCarrinho,
  useRemoverItemCarrinho,
} from '@/funcionalidades/carrinho/usar-carrinho'
import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'
import { useNft } from '@/funcionalidades/catalogo/usar-catalogo'
import type { ErroApi } from '@/tipos/api'
import type { ItemCarrinho } from '@/tipos/dominio'

type PropriedadesLinha = {
  item: ItemCarrinho
  aoFalhar: (mensagem: string) => void
}

function LinhaDoCarrinho({ item, aoFalhar }: PropriedadesLinha) {
  const consultaNft = useNft(item.nftId)
  const definirQuantidade = useDefinirItemCarrinho()
  const removerItem = useRemoverItemCarrinho()

  // Preço visto quando a linha apareceu: se o preço do catálogo mudar,
  // a divergência vira aviso textual — não só cor.
  const [precoInicial, definirPrecoInicial] = useState<string | null>(null)
  if (consultaNft.data && precoInicial === null) {
    definirPrecoInicial(consultaNft.data.precoEth)
  }

  if (consultaNft.isPending) {
    return (
      <div
        role="status"
        className="h-28 animate-pulse rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie motion-reduce:animate-none"
      >
        <span className="sr-only">Carregando item do carrinho</span>
      </div>
    )
  }

  if (consultaNft.isError) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-3 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-4"
      >
        <p className="text-sm text-texto">
          Não foi possível carregar o item {item.nftId}.
        </p>
        <Botao
          type="button"
          variante="secundaria"
          tamanho="pequeno"
          onClick={() => void consultaNft.refetch()}
        >
          Tentar novamente
        </Botao>
      </div>
    )
  }

  const nft = consultaNft.data
  const limite = Math.max(1, nft.edicao.disponiveis)
  const precoMudou = precoInicial !== null && !ethSaoIguais(nft.precoEth, precoInicial)
  const mutacaoPendente = definirQuantidade.isPending || removerItem.isPending

  function mudarQuantidade(quantidade: number) {
    definirQuantidade.mutate(
      { nftId: nft.id, quantidade },
      {
        onError: (erro) => aoFalhar((erro as unknown as ErroApi).mensagem),
      },
    )
  }

  return (
    <div className="flex gap-4 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-4">
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="shrink-0 overflow-hidden rounded-lg"
      >
        <img
          src={nft.imagem}
          alt={`Arte do NFT ${nft.nome}`}
          className="h-24 w-24 object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-titulo">
            <Link to="/nfts/$nftId" params={{ nftId: nft.id }}>
              {nft.nome}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-texto">{formatarEth(nft.precoEth)} cada</p>
          <p className="mt-1 text-sm font-bold text-titulo">
            {formatarEth(multiplicarEth(nft.precoEth, item.quantidade))} no total
          </p>
          {precoMudou ? (
            <p role="status" className="mt-1 text-xs font-bold text-destaque">
              O preço deste NFT mudou. A cotação abaixo já usa o preço atual.
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label={`Quantidade de ${nft.nome}`}
            className="flex items-center rounded-full border border-[var(--cor-borda)]"
          >
            <Botao
              type="button"
              variante="texto"
              tamanho="icone"
              aria-label={`Diminuir quantidade de ${nft.nome}`}
              disabled={item.quantidade <= 1 || mutacaoPendente}
              onClick={() => mudarQuantidade(item.quantidade - 1)}
            >
              <Minus aria-hidden="true" size={16} />
            </Botao>
            <output
              aria-live="polite"
              className="min-w-8 text-center font-bold text-titulo"
            >
              {item.quantidade}
            </output>
            <Botao
              type="button"
              variante="texto"
              tamanho="icone"
              aria-label={`Aumentar quantidade de ${nft.nome}`}
              disabled={item.quantidade >= limite || mutacaoPendente}
              onClick={() => mudarQuantidade(item.quantidade + 1)}
            >
              <Plus aria-hidden="true" size={16} />
            </Botao>
          </div>

          <Botao
            type="button"
            variante="secundaria"
            tamanho="icone"
            aria-label={`Remover ${nft.nome} do carrinho`}
            disabled={mutacaoPendente}
            onClick={() => removerItem.mutate(nft.id)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </Botao>
        </div>
      </div>
    </div>
  )
}

export function PaginaCarrinho() {
  const { cupom } = useSearch({ from: '/carrinho' })
  const navegar = useNavigate({ from: '/carrinho' })

  const carrinho = useCarrinho()
  const temItens = (carrinho.data?.itens.length ?? 0) > 0
  const cotacao = useCotacao(cupom ?? null, temItens)

  const [cupomDigitado, definirCupomDigitado] = useState('')
  const [mensagem, definirMensagem] = useState('')

  function aoEnviarCupom(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const codigo = cupomDigitado.trim().toUpperCase()
    if (!codigo) {
      definirMensagem('Digite um código de cupom.')
      return
    }
    definirMensagem('')
    void navegar({ search: { cupom: codigo } })
  }

  function removerCupom() {
    definirCupomDigitado('')
    definirMensagem('Cupom removido.')
    void navegar({ search: { cupom: undefined } })
  }

  if (carrinho.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6"
        aria-busy="true"
      >
        <div className="h-64 animate-pulse rounded-[var(--raio-cartao)] bg-superficie motion-reduce:animate-none" />
        <span className="sr-only">Carregando carrinho</span>
      </main>
    )
  }

  if (carrinho.isError) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6"
        role="alert"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          Erro ao carregar o carrinho
        </h1>
        <Botao type="button" className="mt-6" onClick={() => void carrinho.refetch()}>
          Tentar novamente
        </Botao>
      </main>
    )
  }

  if (carrinho.data.itens.length === 0) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          Seu carrinho está vazio
        </h1>
        <p className="mt-3 text-texto">Explore o catálogo e escolha seus NFTs.</p>
        <Botao comoFilho className="mt-6">
          <Link to="/" search={filtrosPadrao}>
            Explorar catálogo
          </Link>
        </Botao>
      </main>
    )
  }

  const erroCotacao = cotacao.isError ? (cotacao.error as unknown as ErroApi) : null

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-black uppercase tracking-tight text-titulo">
        Carrinho
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Itens do carrinho">
          <ul className="space-y-4">
            {carrinho.data.itens.map((item) => (
              <li key={item.nftId}>
                <LinhaDoCarrinho item={item} aoFalhar={definirMensagem} />
              </li>
            ))}
          </ul>
          <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-erro">
            {mensagem}
          </p>
        </section>

        <aside aria-label="Resumo da compra" className="lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-5 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-5">
            <h2 className="text-lg font-bold text-titulo">Resumo</h2>

            {cupom ? (
              <div className="flex items-center justify-between rounded-lg bg-superficie-elevada px-3 py-2 text-sm">
                <span className="font-bold text-titulo">Cupom {cupom}</span>
                <Botao
                  type="button"
                  variante="texto"
                  tamanho="pequeno"
                  aria-label={`Remover cupom ${cupom}`}
                  onClick={removerCupom}
                >
                  <X aria-hidden="true" size={14} />
                  Remover
                </Botao>
              </div>
            ) : (
              <form onSubmit={aoEnviarCupom} className="space-y-2">
                <label
                  htmlFor="campo-cupom"
                  className="block text-sm font-bold text-titulo"
                >
                  Cupom de desconto
                </label>
                <div className="flex gap-2">
                  <input
                    id="campo-cupom"
                    value={cupomDigitado}
                    onChange={(evento) => definirCupomDigitado(evento.target.value)}
                    placeholder="Ex.: KURIO10"
                    className="w-full rounded-lg border border-[var(--cor-borda)] bg-superficie-elevada px-3 py-2.5 text-sm uppercase text-titulo placeholder:text-texto-suave"
                  />
                  <Botao type="submit" variante="secundaria">
                    Aplicar
                  </Botao>
                </div>
              </form>
            )}

            {cotacao.isPending || cotacao.isFetching ? (
              <p role="status" className="text-sm text-texto-suave">
                Calculando cotação…
              </p>
            ) : erroCotacao ? (
              <div role="alert" className="space-y-2 text-sm">
                <p className="font-bold text-erro">{erroCotacao.mensagem}</p>
                {erroCotacao.codigo === 'CUPOM_INVALIDO' ? (
                  <Botao
                    type="button"
                    variante="secundaria"
                    tamanho="pequeno"
                    onClick={removerCupom}
                  >
                    Remover cupom
                  </Botao>
                ) : (
                  <Botao
                    type="button"
                    variante="secundaria"
                    tamanho="pequeno"
                    onClick={() => void cotacao.refetch()}
                  >
                    Tentar novamente
                  </Botao>
                )}
              </div>
            ) : cotacao.data ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-texto">Subtotal</dt>
                  <dd className="font-bold text-titulo">
                    {formatarEth(cotacao.data.subtotalEth)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-texto">
                    Desconto
                    {cotacao.data.cupomAplicado ? ` (${cotacao.data.cupomAplicado})` : ''}
                  </dt>
                  <dd className="font-bold text-sucesso">
                    −{formatarEth(cotacao.data.descontoEth)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-texto">Taxa de rede</dt>
                  <dd className="font-bold text-titulo">
                    {formatarEth(cotacao.data.taxaRedeEth)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[var(--cor-borda)] pt-2 text-base">
                  <dt className="font-bold text-titulo">Total</dt>
                  <dd className="font-black text-destaque">
                    {formatarEth(cotacao.data.totalEth)}
                  </dd>
                </div>
              </dl>
            ) : null}

            <Botao comoFilho className="w-full">
              <Link
                to="/pagamento"
                search={{ cupom: cotacao.data?.cupomAplicado ?? undefined }}
                aria-disabled={!cotacao.data}
              >
                Continuar para pagamento
              </Link>
            </Botao>
          </div>
        </aside>
      </div>
    </main>
  )
}
