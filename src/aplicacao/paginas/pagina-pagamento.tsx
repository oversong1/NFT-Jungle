import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { chaves } from '@/biblioteca/chaves-consulta'
import { ethSaoIguais, formatarEth } from '@/biblioteca/dinheiro'
import { CampoTexto } from '@/componentes/compostos/campo-texto'
import { Botao } from '@/componentes/ui/botao'
import { obterCotacao } from '@/funcionalidades/carrinho/api-carrinho'
import {
  useCarrinho,
  useCotacao,
  useIdentidadeCarrinho,
} from '@/funcionalidades/carrinho/usar-carrinho'
import { useCarteiras } from '@/funcionalidades/carteiras/usar-carteiras'
import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'
import { useNft } from '@/funcionalidades/catalogo/usar-catalogo'
import { criarPedido } from '@/funcionalidades/pedidos/api-pedidos'
import {
  encerrarTentativa,
  hashDaCompra,
  lerTentativa,
  obterOuCriarTentativa,
  registrarPedidoNaTentativa,
} from '@/funcionalidades/pedidos/idempotencia'
import { usePedido } from '@/funcionalidades/pedidos/usar-pedidos'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'
import type { ErroApi } from '@/tipos/api'
import type { Cotacao, ItemCarrinho } from '@/tipos/dominio'

const esquemaColecionador = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome completo.'),
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  carteiraId: z.string().min(1, 'Escolha uma carteira.'),
})

type DadosColecionador = z.infer<typeof esquemaColecionador>

function LinhaDaRevisao({ item }: { item: ItemCarrinho }) {
  const consulta = useNft(item.nftId)
  if (!consulta.data) return null

  return (
    <li className="flex justify-between gap-2">
      <span className="text-texto">
        {item.quantidade}× {consulta.data.nome}
      </span>
      <span className="font-bold text-titulo">{formatarEth(consulta.data.precoEth)}</span>
    </li>
  )
}

/** Acompanhamento da pendência: o desfecho chega por order.updated + revalidação. */
function AcompanhamentoDoPedido({
  pedidoId,
  aoRecusar,
}: {
  pedidoId: string
  aoRecusar: () => void
}) {
  const navegar = useNavigate()
  const cliente = useQueryClient()
  const identidade = useIdentidadeCarrinho()
  const pedido = usePedido(pedidoId)
  const status = pedido.data?.status

  useEffect(() => {
    if (status === 'aprovado') {
      encerrarTentativa()
      void cliente.invalidateQueries({ queryKey: chaves.carrinho(identidade) })
      void cliente.invalidateQueries({ queryKey: chaves.cotacoes(identidade) })
      void navegar({
        to: '/pedido/$orderId/confirmacao',
        params: { orderId: pedidoId },
      })
    }
    if (status === 'recusado') {
      encerrarTentativa()
      aoRecusar()
    }
  }, [status, pedidoId, cliente, identidade, navegar, aoRecusar])

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
    >
      <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
        Processando pagamento…
      </h1>
      <p role="status" aria-live="polite" className="mt-3 text-texto">
        Pedido {pedidoId} aguardando confirmação. Você pode atualizar a página sem perder
        o acompanhamento.
      </p>
    </main>
  )
}

export function PaginaPagamento() {
  const { cupom } = useSearch({ from: '/pagamento' })
  const sessao = useSessao()

  const carrinho = useCarrinho()
  const temItens = (carrinho.data?.itens.length ?? 0) > 0
  const cotacaoExibida = useCotacao(cupom ?? null, temItens)
  const carteiras = useCarteiras()

  // Tentativa pendente sobrevive ao F5 (sessionStorage).
  const [pedidoEmAndamento, definirPedidoEmAndamento] = useState<string | null>(
    () => lerTentativa()?.pedidoId ?? null,
  )
  const [cotacaoDivergente, definirCotacaoDivergente] = useState<Cotacao | null>(null)
  const [mensagemErro, definirMensagemErro] = useState('')

  const formulario = useForm<DadosColecionador>({
    resolver: zodResolver(esquemaColecionador),
    defaultValues: {
      nome: sessao.data?.usuario.nome ?? '',
      email: sessao.data?.usuario.email ?? '',
      carteiraId: '',
    },
  })

  const carteiraEscolhida = useWatch({
    control: formulario.control,
    name: 'carteiraId',
  })
  const { setValue } = formulario
  useEffect(() => {
    if (!carteiraEscolhida && carteiras.data && carteiras.data.length > 0) {
      const principal = carteiras.data.find((carteira) => carteira.principal)
      setValue('carteiraId', (principal ?? carteiras.data[0]).id)
    }
  }, [carteiras.data, carteiraEscolhida, setValue])

  const enviarPedido = useMutation({
    mutationFn: async (dados: DadosColecionador) => {
      // 1. Cotação NOVA imediatamente antes de confirmar.
      const recente = await obterCotacao(cupom ?? null)

      // 2. Divergência com o que a pessoa viu bloqueia o envio.
      const referencia = cotacaoDivergente ?? cotacaoExibida.data
      const mudou =
        !referencia ||
        !ethSaoIguais(recente.totalEth, referencia.totalEth) ||
        recente.cupomAplicado !== referencia.cupomAplicado

      if (mudou) {
        definirCotacaoDivergente(recente)
        throw { codigo: 'COTACAO_MUDOU' }
      }

      // 3. Chave por tentativa: clique repetido reutiliza a mesma chave.
      const hash = hashDaCompra({
        itens: carrinho.data?.itens ?? [],
        cupom: recente.cupomAplicado,
        carteiraId: dados.carteiraId,
      })
      const tentativa = obterOuCriarTentativa(hash)

      try {
        const pedido = await criarPedido(
          { cupom: recente.cupomAplicado, carteiraId: dados.carteiraId },
          tentativa.chave,
        )
        registrarPedidoNaTentativa(pedido.id)
        return pedido
      } catch (erro) {
        // 4. Resposta perdida (timeout/rede) DEPOIS de o pedido nascer:
        //    reenvio com a MESMA chave recupera o pedido, sem duplicar.
        const erroApi = erro as unknown as ErroApi
        if (erroApi.status === 0 || erroApi.status >= 500) {
          const recuperado = await criarPedido(
            { cupom: recente.cupomAplicado, carteiraId: dados.carteiraId },
            tentativa.chave,
          )
          registrarPedidoNaTentativa(recuperado.id)
          return recuperado
        }
        throw erro
      }
    },
    retry: false,
    onSuccess: (pedido) => {
      definirMensagemErro('')
      definirPedidoEmAndamento(pedido.id)
    },
    onError: (erro) => {
      const erroApi = erro as unknown as ErroApi & { codigo?: string }
      if (erroApi.codigo === 'COTACAO_MUDOU') return // tratado pela própria tela
      definirMensagemErro(erroApi.mensagem ?? 'Não foi possível criar o pedido.')
    },
  })

  if (pedidoEmAndamento) {
    return (
      <AcompanhamentoDoPedido
        pedidoId={pedidoEmAndamento}
        aoRecusar={() => {
          definirPedidoEmAndamento(null)
          definirMensagemErro(
            'Pagamento recusado na simulação. Seus itens continuam no carrinho.',
          )
        }}
      />
    )
  }

  if (carrinho.isPending || carteiras.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-4xl px-4 py-10 sm:px-6"
        aria-busy="true"
      >
        <div className="h-72 animate-pulse rounded-[var(--raio-cartao)] bg-superficie motion-reduce:animate-none" />
        <span className="sr-only">Carregando pagamento</span>
      </main>
    )
  }

  if (!temItens) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          Nada para pagar
        </h1>
        <p className="mt-3 text-texto">Seu carrinho está vazio.</p>
        <Botao comoFilho className="mt-6">
          <Link to="/" search={filtrosPadrao}>
            Explorar catálogo
          </Link>
        </Botao>
      </main>
    )
  }

  const cotacaoParaExibir = cotacaoDivergente ?? cotacaoExibida.data
  const listaCarteiras = carteiras.data ?? []
  const erros = formulario.formState.errors

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-black uppercase tracking-tight text-titulo">
        Pagamento
      </h1>

      <form
        noValidate
        onSubmit={formulario.handleSubmit((dados) => enviarPedido.mutate(dados))}
        className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_20rem]"
      >
        <section aria-label="Dados do colecionador e carteira" className="space-y-5">
          <CampoTexto
            id="campo-nome"
            rotulo="Nome completo"
            autoComplete="name"
            erro={erros.nome?.message}
            {...formulario.register('nome')}
          />
          <CampoTexto
            id="campo-email"
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            erro={erros.email?.message}
            {...formulario.register('email')}
          />

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-titulo">
              Carteira de pagamento
            </legend>
            {listaCarteiras.length === 0 ? (
              <p className="text-sm text-texto">
                Você ainda não tem carteira cadastrada. Cadastre uma em{' '}
                <Link to="/carteiras" className="font-bold text-destaque underline">
                  Carteiras
                </Link>{' '}
                e volte para concluir.
              </p>
            ) : (
              <ul className="space-y-2">
                {listaCarteiras.map((carteira) => (
                  <li key={carteira.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--cor-borda)] bg-superficie p-3">
                      <input
                        type="radio"
                        value={carteira.id}
                        {...formulario.register('carteiraId')}
                      />
                      <span className="text-sm">
                        <span className="font-bold text-titulo">{carteira.apelido}</span>{' '}
                        <span className="text-texto-suave">
                          ({carteira.rede}) {carteira.endereco.slice(0, 10)}…
                          {carteira.principal ? ' — principal' : ''}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {erros.carteiraId ? (
              <p role="alert" className="mt-2 text-sm text-erro">
                {erros.carteiraId.message}
              </p>
            ) : null}
          </fieldset>
        </section>

        <aside
          aria-label="Revisão do pedido"
          className="space-y-4 self-start rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-5"
        >
          <h2 className="text-lg font-bold text-titulo">Revisão</h2>

          <ul className="space-y-2 text-sm">
            {(carrinho.data?.itens ?? []).map((item) => (
              <LinhaDaRevisao key={item.nftId} item={item} />
            ))}
          </ul>

          {cotacaoParaExibir ? (
            <dl className="space-y-1.5 border-t border-[var(--cor-borda)] pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-texto">Subtotal</dt>
                <dd className="text-titulo">
                  {formatarEth(cotacaoParaExibir.subtotalEth)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-texto">
                  Desconto
                  {cotacaoParaExibir.cupomAplicado
                    ? ` (${cotacaoParaExibir.cupomAplicado})`
                    : ''}
                </dt>
                <dd className="text-sucesso">
                  −{formatarEth(cotacaoParaExibir.descontoEth)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-texto">Taxa de rede</dt>
                <dd className="text-titulo">
                  {formatarEth(cotacaoParaExibir.taxaRedeEth)}
                </dd>
              </div>
              <div className="flex justify-between text-base">
                <dt className="font-bold text-titulo">Total</dt>
                <dd className="font-black text-destaque">
                  {formatarEth(cotacaoParaExibir.totalEth)}
                </dd>
              </div>
            </dl>
          ) : null}

          {cotacaoDivergente ? (
            <div
              role="alert"
              className="rounded-lg border border-destaque/60 bg-superficie-elevada p-3 text-sm"
            >
              <p className="font-bold text-destaque">
                A cotação mudou desde a sua revisão.
              </p>
              <p className="mt-1 text-texto">
                Os valores acima já são os novos. Confira e clique em Confirmar de novo.
              </p>
            </div>
          ) : null}

          <Botao
            type="submit"
            className="w-full"
            disabled={enviarPedido.isPending || listaCarteiras.length === 0}
          >
            {enviarPedido.isPending ? 'Confirmando…' : 'Confirmar pedido'}
          </Botao>

          <p role="alert" aria-live="assertive" className="min-h-5 text-sm text-erro">
            {mensagemErro}
          </p>
        </aside>
      </form>
    </main>
  )
}
