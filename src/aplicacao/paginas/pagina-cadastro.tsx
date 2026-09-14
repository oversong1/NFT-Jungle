import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { CampoTexto } from '@/componentes/compostos/campo-texto'
import { Botao } from '@/componentes/ui/botao'
import { esquemaCadastro, type DadosCadastro } from '@/funcionalidades/sessao/esquemas'
import { useCadastrar } from '@/funcionalidades/sessao/usar-sessao'
import type { ErroApi } from '@/tipos/api'

export function PaginaCadastro() {
  const roteador = useRouter()
  const cadastrarMutation = useCadastrar()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DadosCadastro>({
    resolver: zodResolver(esquemaCadastro),
  })

  async function aoEnviar(dados: DadosCadastro) {
    try {
      await cadastrarMutation.mutateAsync(dados)
      roteador.history.push('/')
    } catch (erro) {
      const erroApi = erro as ErroApi

      if (erroApi.campos) {
        for (const [campo, mensagem] of Object.entries(erroApi.campos)) {
          setError(campo as keyof DadosCadastro, { message: mensagem })
        }
        return
      }
      setError('root', { message: erroApi.mensagem })
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
        Criar conta
      </h1>

      <form
        onSubmit={handleSubmit(aoEnviar)}
        noValidate
        className="mt-8 flex flex-col gap-5"
      >
        <CampoTexto
          id="cadastro-nome"
          rotulo="Nome"
          type="text"
          autoComplete="name"
          erro={errors.nome?.message}
          {...register('nome')}
        />
        <CampoTexto
          id="cadastro-email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          erro={errors.email?.message}
          {...register('email')}
        />
        <CampoTexto
          id="cadastro-senha"
          rotulo="Senha"
          type="password"
          autoComplete="new-password"
          erro={errors.senha?.message}
          {...register('senha')}
        />
        <CampoTexto
          id="cadastro-confirmacao"
          rotulo="Repita a senha"
          type="password"
          autoComplete="new-password"
          erro={errors.confirmacaoSenha?.message}
          {...register('confirmacaoSenha')}
        />

        {errors.root ? (
          <p
            role="alert"
            className="rounded-xl border border-erro/40 bg-erro/10 px-4 py-3 text-sm text-erro"
          >
            {errors.root.message}
          </p>
        ) : null}

        <Botao type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>

      <p className="mt-6 text-sm text-texto">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-bold text-destaque hover:text-titulo">
          Entrar
        </Link>
      </p>
    </main>
  )
}
