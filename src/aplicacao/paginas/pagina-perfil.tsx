import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import {
  useForm,
  type FieldValues,
  type Path,
  type UseFormSetError,
} from 'react-hook-form'

import { CampoTexto } from '@/componentes/compostos/campo-texto'
import { Botao } from '@/componentes/ui/botao'
import {
  arquivoParaDataUrl,
  esquemaEdicaoPerfil,
  esquemaTrocaSenha,
  validarArquivoAvatar,
  type EdicaoPerfil,
  type TrocaSenha,
} from '@/funcionalidades/perfil/esquemas'
import {
  useAtualizarPerfil,
  usePerfil,
  useTrocarSenha,
} from '@/funcionalidades/perfil/usar-perfil'
import type { ErroApi } from '@/tipos/api'
import type { Usuario } from '@/tipos/dominio'

/** Erros de campo da API caem no campo; sem campo, caem na raiz. */
function aplicarErroApi<T extends FieldValues>(
  erro: unknown,
  setError: UseFormSetError<T>,
) {
  const erroApi = erro as ErroApi
  const campos = Object.entries(erroApi.campos ?? {})
  for (const [campo, mensagem] of campos) {
    setError(campo as Path<T>, { type: 'server', message: mensagem })
  }
  if (campos.length === 0) {
    setError('root', { type: 'server', message: erroApi.mensagem })
  }
}

function SecaoAvatar({ perfil }: { perfil: Usuario }) {
  const atualizarPerfil = useAtualizarPerfil()
  const [erroLocal, definirErroLocal] = useState('')
  const referenciaEntrada = useRef<HTMLInputElement>(null)

  async function aoEscolherArquivo(arquivo: File | undefined) {
    if (!arquivo) return

    const erroValidacao = validarArquivoAvatar(arquivo)
    if (erroValidacao) {
      definirErroLocal(erroValidacao)
      return
    }

    definirErroLocal('')
    try {
      const avatarUrl = await arquivoParaDataUrl(arquivo)
      await atualizarPerfil.mutateAsync({ avatarUrl })
    } catch (erro) {
      definirErroLocal((erro as ErroApi).mensagem ?? 'Falha ao enviar a imagem.')
    } finally {
      if (referenciaEntrada.current) referenciaEntrada.current.value = ''
    }
  }

  return (
    <section
      aria-labelledby="titulo-avatar"
      className="flex flex-wrap items-center gap-5"
    >
      <h2 id="titulo-avatar" className="sr-only">
        Foto de perfil
      </h2>

      <div className="h-24 w-24 overflow-hidden rounded-full border border-[var(--cor-borda)] bg-superficie-elevada">
        {perfil.avatarUrl ? (
          <img
            src={perfil.avatarUrl}
            alt={`Avatar de ${perfil.nome}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-2xl font-black text-texto-suave"
          >
            {perfil.nome.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={referenciaEntrada}
          id="entrada-avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(evento) => void aoEscolherArquivo(evento.target.files?.[0])}
        />
        <Botao
          type="button"
          variante="secundaria"
          disabled={atualizarPerfil.isPending}
          onClick={() => referenciaEntrada.current?.click()}
        >
          {atualizarPerfil.isPending ? 'Enviando…' : 'Trocar avatar'}
        </Botao>
        <p className="text-xs text-texto-suave">JPG, PNG ou WebP com até 2 MB.</p>
        <p role="alert" className="min-h-5 text-sm text-erro">
          {erroLocal}
        </p>
      </div>
    </section>
  )
}

function FormularioDados({ perfil }: { perfil: Usuario }) {
  const atualizarPerfil = useAtualizarPerfil()

  const formulario = useForm<EdicaoPerfil>({
    resolver: zodResolver(esquemaEdicaoPerfil),
    defaultValues: { nome: perfil.nome },
  })
  const erros = formulario.formState.errors

  async function aoEnviar(dados: EdicaoPerfil) {
    try {
      await atualizarPerfil.mutateAsync({ nome: dados.nome })
      formulario.reset({ nome: dados.nome })
    } catch (erro) {
      aplicarErroApi(erro, formulario.setError)
    }
  }

  return (
    <section aria-labelledby="titulo-dados">
      <h2 id="titulo-dados" className="mb-4 text-xl font-bold text-titulo">
        Dados pessoais
      </h2>

      <form noValidate onSubmit={formulario.handleSubmit(aoEnviar)} className="space-y-5">
        <CampoTexto
          id="campo-nome-perfil"
          rotulo="Nome completo"
          autoComplete="name"
          erro={erros.nome?.message}
          {...formulario.register('nome')}
        />
        <CampoTexto
          id="campo-email-perfil"
          rotulo="E-mail"
          type="email"
          value={perfil.email}
          disabled
          readOnly
        />

        {erros.root ? (
          <p role="alert" className="text-sm font-semibold text-erro">
            {erros.root.message}
          </p>
        ) : null}
        {atualizarPerfil.isSuccess && !formulario.formState.isDirty ? (
          <p role="status" className="text-sm font-semibold text-sucesso">
            Perfil atualizado.
          </p>
        ) : null}

        <Botao type="submit" disabled={atualizarPerfil.isPending}>
          {atualizarPerfil.isPending ? 'Salvando…' : 'Salvar alterações'}
        </Botao>
      </form>
    </section>
  )
}

function FormularioSenha() {
  const trocarSenha = useTrocarSenha()

  const formulario = useForm<TrocaSenha>({
    resolver: zodResolver(esquemaTrocaSenha),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmacao: '' },
  })
  const erros = formulario.formState.errors

  async function aoEnviar(dados: TrocaSenha) {
    try {
      await trocarSenha.mutateAsync({
        senhaAtual: dados.senhaAtual,
        novaSenha: dados.novaSenha,
      })
      // Limpa os campos: nenhum valor sensível fica na tela.
      formulario.reset()
    } catch (erro) {
      aplicarErroApi(erro, formulario.setError)
    }
  }

  return (
    <section aria-labelledby="titulo-senha">
      <h2 id="titulo-senha" className="mb-4 text-xl font-bold text-titulo">
        Alterar senha
      </h2>

      <form noValidate onSubmit={formulario.handleSubmit(aoEnviar)} className="space-y-5">
        <CampoTexto
          id="campo-senha-atual"
          rotulo="Senha atual"
          type="password"
          autoComplete="current-password"
          erro={erros.senhaAtual?.message}
          {...formulario.register('senhaAtual')}
        />
        <CampoTexto
          id="campo-nova-senha"
          rotulo="Nova senha"
          type="password"
          autoComplete="new-password"
          erro={erros.novaSenha?.message}
          {...formulario.register('novaSenha')}
        />
        <CampoTexto
          id="campo-confirmacao-senha"
          rotulo="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          erro={erros.confirmacao?.message}
          {...formulario.register('confirmacao')}
        />

        {erros.root ? (
          <p role="alert" className="text-sm font-semibold text-erro">
            {erros.root.message}
          </p>
        ) : null}
        {trocarSenha.isSuccess ? (
          <p role="status" className="text-sm font-semibold text-sucesso">
            Senha alterada.
          </p>
        ) : null}

        <Botao type="submit" variante="secundaria" disabled={trocarSenha.isPending}>
          {trocarSenha.isPending ? 'Alterando…' : 'Alterar senha'}
        </Botao>
      </form>
    </section>
  )
}

export function PaginaPerfil() {
  const consulta = usePerfil()

  if (consulta.isPending) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        aria-busy="true"
      >
        <div className="h-72 animate-pulse rounded-[var(--raio-cartao)] bg-superficie motion-reduce:animate-none" />
        <span className="sr-only">Carregando perfil</span>
      </main>
    )
  }

  if (consulta.isError) {
    return (
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
        role="alert"
      >
        <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
          Erro ao carregar o perfil
        </h1>
        <Botao type="button" className="mt-6" onClick={() => void consulta.refetch()}>
          Tentar novamente
        </Botao>
      </main>
    )
  }

  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6"
    >
      <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
        Meu perfil
      </h1>
      <SecaoAvatar perfil={consulta.data} />
      <FormularioDados perfil={consulta.data} />
      <FormularioSenha />
    </main>
  )
}
