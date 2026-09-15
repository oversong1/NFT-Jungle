import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { CampoTexto } from '@/componentes/compostos/campo-texto'
import { MolduraSessao, ProvedoresSociais } from '@/componentes/compostos/moldura-sessao'
import { Botao } from '@/componentes/ui/botao'
import { esquemaEntrar, type DadosEntrar } from '@/funcionalidades/sessao/esquemas'
import { useEntrar } from '@/funcionalidades/sessao/usar-sessao'
import type { ErroApi } from '@/tipos/api'

export function PaginaEntrar() {
  const busca = useSearch({ from: '/entrar' })
  const roteador = useRouter()
  const entrarMutation = useEntrar()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DadosEntrar>({
    resolver: zodResolver(esquemaEntrar),
  })

  async function aoEnviar(dados: DadosEntrar) {
    try {
      await entrarMutation.mutateAsync(dados)
      // Devolve a pessoa exatamente ao destino que a guarda preservou.
      roteador.history.push(busca.redirect ?? '/')
    } catch (erro) {
      const erroApi = erro as ErroApi

      if (erroApi.campos) {
        for (const [campo, mensagem] of Object.entries(erroApi.campos)) {
          setError(campo as keyof DadosEntrar, { message: mensagem })
        }
        return
      }
      setError('root', { message: erroApi.mensagem })
    }
  }

  return (
    <MolduraSessao ativa="entrar" rotuloTitulo="titulo-entrar">
      <div>
        <h1
          id="titulo-entrar"
          className="text-2xl font-black uppercase tracking-tight text-titulo"
        >
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-sm text-texto">
          Use a conta de demonstração: aline@kurio.dev / Kurio@123
        </p>
      </div>

      <form onSubmit={handleSubmit(aoEnviar)} noValidate className="flex flex-col gap-5">
        <CampoTexto
          id="entrar-email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          erro={errors.email?.message}
          {...register('email')}
        />
        <CampoTexto
          id="entrar-senha"
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          erro={errors.senha?.message}
          {...register('senha')}
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
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>

      <ProvedoresSociais />

      <p className="text-center text-sm text-texto">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-bold text-destaque hover:text-titulo">
          Criar cadastro
        </Link>
      </p>
    </MolduraSessao>
  )
}
