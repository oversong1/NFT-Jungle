import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { CampoTexto } from '@/componentes/compostos/campo-texto'
import { MolduraSessao, ProvedoresSociais } from '@/componentes/compostos/moldura-sessao'
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
    <MolduraSessao ativa="cadastro" rotuloTitulo="titulo-cadastro">
      <div>
        <h1
          id="titulo-cadastro"
          className="text-2xl font-black uppercase tracking-tight text-titulo"
        >
          Criar conta
        </h1>
        <p className="mt-2 text-sm text-texto">
          Leva menos de um minuto para começar a colecionar.
        </p>
      </div>

      <form onSubmit={handleSubmit(aoEnviar)} noValidate className="flex flex-col gap-5">
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

        <Botao type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Botao>
      </form>

      <ProvedoresSociais />

      <p className="text-center text-sm text-texto">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-bold text-destaque hover:text-titulo">
          Entrar
        </Link>
      </p>
    </MolduraSessao>
  )
}
