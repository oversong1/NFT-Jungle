import { Link, useParams } from '@tanstack/react-router'

import { formatarEth, multiplicarEth } from '@/biblioteca/dinheiro'
import { Botao } from '@/componentes/ui/botao'
import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'
import { usePedido } from '@/funcionalidades/pedidos/usar-pedidos'
import type { ErroApi } from '@/tipos/api'

export function PaginaConfirmacaoPedido() {
  const { orderId } = useParams({ from: '/pedido/$orderId/confirmacao' })
  const consulta = usePedido(orderId)

  if (consulta.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        aria-busy="true"
      >
        <div className="h-72 animate-pulse rounded-[var(--raio-cartao)] bg-superficie motion-reduce:animate-none" />
        <span className="sr-only">Carregando pedido</span>
      </main>
    )
  }

  if (consulta.isError) {
    const erro = consulta.error as unknown as ErroApi
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
        role="alert"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          {erro.status === 404 ? 'Pedido não encontrado' : 'Erro ao carregar o pedido'}
        </h1>
        <p className="mt-4 text-texto">{erro.mensagem}</p>
        <Botao comoFilho className="mt-8">
          <Link to="/" search={filtrosPadrao}>
            Voltar ao catálogo
          </Link>
        </Botao>
      </main>
    )
  }

  const pedido = consulta.data

  if (pedido.status !== 'aprovado') {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          {pedido.status === 'processando'
            ? 'Este pedido ainda está em processamento'
            : 'Este pedido foi recusado'}
        </h1>
        <p role="status" aria-live="polite" className="mt-3 text-texto">
          {pedido.status === 'processando'
            ? 'O recibo aparece automaticamente quando o pagamento for aprovado.'
            : 'Seus itens continuam no carrinho.'}
        </p>
        <Botao comoFilho className="mt-6">
          <Link
            to={pedido.status === 'processando' ? '/pagamento' : '/carrinho'}
            search={{ cupom: undefined }}
          >
            {pedido.status === 'processando'
              ? 'Acompanhar pagamento'
              : 'Voltar ao carrinho'}
          </Link>
        </Botao>
      </main>
    )
  }

  const { recibo } = pedido

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-sucesso">
          Pagamento aprovado
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-titulo">
          Recibo do pedido
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          Transação simulada {pedido.id} —{' '}
          {new Date(pedido.criadoEm).toLocaleString('pt-BR')}
          {pedido.carteiraId ? ` — carteira ${pedido.carteiraId}` : ''}
        </p>
      </header>

      <section
        aria-label="Recibo"
        className="rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-6"
      >
        <ul className="space-y-3">
          {recibo.itens.map((item) => (
            <li key={item.nftId} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-titulo">{item.nome}</p>
                <p className="text-xs text-texto-suave">
                  {item.quantidade}× {formatarEth(item.precoUnitarioEth)}
                </p>
              </div>
              <p className="font-bold text-titulo">
                {formatarEth(multiplicarEth(item.precoUnitarioEth, item.quantidade))}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-1.5 border-t border-[var(--cor-borda)] pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-texto">Subtotal</dt>
            <dd className="text-titulo">{formatarEth(recibo.subtotalEth)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-texto">
              Desconto{recibo.cupomAplicado ? ` (${recibo.cupomAplicado})` : ''}
            </dt>
            <dd className="text-sucesso">−{formatarEth(recibo.descontoEth)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-texto">Taxa de rede</dt>
            <dd className="text-titulo">{formatarEth(recibo.taxaRedeEth)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-bold text-titulo">Total pago</dt>
            <dd className="font-black text-destaque">{formatarEth(recibo.totalEth)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 text-center">
        <Botao comoFilho>
          <Link to="/" search={filtrosPadrao}>
            Continuar explorando
          </Link>
        </Botao>
      </div>
    </main>
  )
}
