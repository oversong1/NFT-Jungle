import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { CampoTexto } from '@/componentes/compostos/campo-texto'
import { PainelConta } from '@/componentes/compostos/painel-conta'
import { Botao } from '@/componentes/ui/botao'
import { redesCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'
import { rotulosRede } from '@/funcionalidades/catalogo/rotulos'
import {
  useAtualizarCarteira,
  useCarteiras,
  useCriarCarteira,
  useRemoverCarteira,
} from '@/funcionalidades/carteiras/usar-carteiras'
import type { ErroApi } from '@/tipos/api'
import type { Carteira, RedeNft } from '@/tipos/dominio'

/** Redes válidas do projeto, sem a opção 'todas' dos filtros. */
const redes = redesCatalogo.filter((rede) => rede !== 'todas') as RedeNft[]

const esquemaCarteira = z.object({
  apelido: z
    .string()
    .trim()
    .min(2, 'Dê um apelido com pelo menos 2 caracteres.')
    .max(32, 'O apelido pode ter no máximo 32 caracteres.'),
  endereco: z
    .string()
    .trim()
    .regex(
      /^0x[0-9a-fA-F]{40}$/,
      'Use o formato 0x seguido de 40 caracteres hexadecimais.',
    ),
  rede: z.enum(redes as [RedeNft, ...RedeNft[]], { message: 'Escolha uma rede.' }),
  principal: z.boolean(),
})

type DadosFormularioCarteira = z.infer<typeof esquemaCarteira>

function FormularioCarteira({
  carteira,
  aoFechar,
}: {
  carteira?: Carteira
  aoFechar: () => void
}) {
  const criar = useCriarCarteira()
  const atualizar = useAtualizarCarteira()
  const editando = Boolean(carteira)

  const formulario = useForm<DadosFormularioCarteira>({
    resolver: zodResolver(esquemaCarteira),
    defaultValues: carteira
      ? {
          apelido: carteira.apelido,
          endereco: carteira.endereco,
          rede: carteira.rede,
          principal: carteira.principal,
        }
      : { apelido: '', endereco: '', rede: 'ethereum', principal: false },
  })
  const erros = formulario.formState.errors

  async function aoEnviar(dados: DadosFormularioCarteira) {
    try {
      if (carteira) {
        // O endereço não é editável: identifica a carteira desde o cadastro.
        await atualizar.mutateAsync({
          carteiraId: carteira.id,
          dados: {
            apelido: dados.apelido,
            rede: dados.rede,
            principal: dados.principal,
          },
        })
      } else {
        await criar.mutateAsync(dados)
      }
      aoFechar()
    } catch (erro) {
      const erroApi = erro as ErroApi
      const campos = Object.entries(erroApi.campos ?? {})
      for (const [campo, mensagem] of campos) {
        formulario.setError(campo as keyof DadosFormularioCarteira, {
          type: 'server',
          message: mensagem,
        })
      }
      if (campos.length === 0) {
        formulario.setError('root', { type: 'server', message: erroApi.mensagem })
      }
    }
  }

  const pendente = criar.isPending || atualizar.isPending

  return (
    <form
      noValidate
      onSubmit={formulario.handleSubmit(aoEnviar)}
      aria-label={editando ? `Editar carteira ${carteira!.apelido}` : 'Nova carteira'}
      className="space-y-5 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie-elevada p-5 sm:p-6"
    >
      <h2 className="text-lg font-bold text-titulo">
        {editando ? 'Editar carteira' : 'Nova carteira'}
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          id="campo-apelido"
          rotulo="Apelido"
          erro={erros.apelido?.message}
          {...formulario.register('apelido')}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="campo-rede" className="text-sm font-bold text-titulo">
            Rede
          </label>
          <select
            id="campo-rede"
            className="min-h-11 rounded-full border border-[var(--cor-borda)] bg-superficie px-4 text-titulo"
            {...formulario.register('rede')}
          >
            {redes.map((rede) => (
              <option key={rede} value={rede}>
                {rotulosRede[rede]}
              </option>
            ))}
          </select>
          {erros.rede ? (
            <p role="alert" className="text-sm text-erro">
              {erros.rede.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          {editando ? (
            <CampoTexto
              id="campo-endereco"
              rotulo="Endereço"
              value={carteira!.endereco}
              disabled
              readOnly
              className="font-mono"
            />
          ) : (
            <CampoTexto
              id="campo-endereco"
              rotulo="Endereço"
              placeholder="0x…"
              spellCheck={false}
              className="font-mono"
              erro={erros.endereco?.message}
              {...formulario.register('endereco')}
            />
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="campo-principal"
          type="checkbox"
          className="mt-1 h-5 w-5 accent-[var(--cor-acao)]"
          {...formulario.register('principal')}
        />
        <label htmlFor="campo-principal" className="text-sm text-texto">
          <span className="font-bold text-titulo">Usar como carteira principal.</span> A
          principal atual será rebaixada para secundária.
        </label>
      </div>
      {erros.principal ? (
        <p role="alert" className="text-sm text-erro">
          {erros.principal.message}
        </p>
      ) : null}
      {erros.root ? (
        <p role="alert" className="text-sm font-semibold text-erro">
          {erros.root.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Botao type="submit" disabled={pendente}>
          {pendente ? 'Salvando…' : editando ? 'Salvar carteira' : 'Cadastrar carteira'}
        </Botao>
        <Botao type="button" variante="secundaria" onClick={aoFechar}>
          Cancelar
        </Botao>
      </div>
    </form>
  )
}

function CartaoCarteira({
  carteira,
  aoEditar,
}: {
  carteira: Carteira
  aoEditar: () => void
}) {
  const remover = useRemoverCarteira()
  const [erroRemocao, definirErroRemocao] = useState('')

  async function aoRemover() {
    const confirmado = window.confirm(
      `Remover a carteira "${carteira.apelido}"? Esta ação não pode ser desfeita.`,
    )
    if (!confirmado) return

    definirErroRemocao('')
    try {
      await remover.mutateAsync(carteira.id)
    } catch (erro) {
      definirErroRemocao((erro as ErroApi).mensagem)
    }
  }

  return (
    <article className="flex h-full flex-col gap-3 rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[var(--cor-borda)] px-3 py-1 text-xs font-bold text-texto">
          {rotulosRede[carteira.rede]}
        </span>
        {carteira.principal ? (
          <span className="rounded-full bg-acao px-3 py-1 text-xs font-bold text-fundo">
            Principal
          </span>
        ) : null}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold text-titulo">{carteira.apelido}</h2>
        <p className="break-all font-mono text-sm text-texto">{carteira.endereco}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Botao type="button" variante="secundaria" tamanho="pequeno" onClick={aoEditar}>
          Editar
        </Botao>
        <Botao
          type="button"
          variante="texto"
          tamanho="pequeno"
          disabled={remover.isPending}
          onClick={() => void aoRemover()}
        >
          {remover.isPending ? 'Removendo…' : 'Remover'}
        </Botao>
      </div>

      <p role="alert" className="min-h-5 text-sm text-erro">
        {erroRemocao}
      </p>
    </article>
  )
}

export function PaginaCarteiras() {
  const consulta = useCarteiras()
  const [emEdicao, definirEmEdicao] = useState<string | null>(null)
  const [criando, definirCriando] = useState(false)

  if (consulta.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
        aria-busy="true"
      >
        <div className="h-72 animate-pulse rounded-[var(--raio-cartao)] bg-superficie motion-reduce:animate-none" />
        <span className="sr-only">Carregando carteiras</span>
      </main>
    )
  }

  if (consulta.isError) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
        role="alert"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          Erro ao carregar as carteiras
        </h1>
        <Botao type="button" className="mt-6" onClick={() => void consulta.refetch()}>
          Tentar novamente
        </Botao>
      </main>
    )
  }

  const carteiras = consulta.data

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <PainelConta />

        <div className="space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
              Minhas carteiras
            </h1>
            <Botao type="button" onClick={() => definirCriando(true)} disabled={criando}>
              Adicionar carteira
            </Botao>
          </header>

          <p className="text-sm text-texto-suave">
            A carteira principal é usada como padrão no pagamento. Toda conta com
            carteiras mantém exatamente uma principal; ao promover outra, a anterior vira
            secundária automaticamente.
          </p>

          {carteiras.length === 0 && !criando ? (
            <div className="rounded-[var(--raio-cartao)] border border-[var(--cor-borda)] bg-superficie p-8 text-center">
              <p className="text-titulo">Você ainda não cadastrou carteiras.</p>
              <p className="mt-1 text-sm text-texto-suave">
                Cadastre uma para conseguir concluir pagamentos.
              </p>
            </div>
          ) : null}

          <ul className="grid items-start gap-4 xl:grid-cols-2">
            {carteiras.map((carteira) => (
              <li
                key={carteira.id}
                className={emEdicao === carteira.id ? 'xl:col-span-2' : undefined}
              >
                {emEdicao === carteira.id ? (
                  <FormularioCarteira
                    carteira={carteira}
                    aoFechar={() => definirEmEdicao(null)}
                  />
                ) : (
                  <CartaoCarteira
                    carteira={carteira}
                    aoEditar={() => definirEmEdicao(carteira.id)}
                  />
                )}
              </li>
            ))}
          </ul>

          {criando ? <FormularioCarteira aoFechar={() => definirCriando(false)} /> : null}
        </div>
      </div>
    </main>
  )
}
