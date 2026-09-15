import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { CampoTexto } from '@/componentes/compostos/campo-texto'
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
    <main id="conteudo" tabIndex={-1} className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">Entrar</h1>
      <p className="mt-2 text-sm text-texto">
        Use a conta de demonstração: aline@kurio.dev / Kurio@123
      </p>

      <form
        onSubmit={handleSubmit(aoEnviar)}
        noValidate
        className="mt-8 flex flex-col gap-5"
      >
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

        <Botao type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Botao>
      </form>

      <p className="mt-6 text-sm text-texto">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-bold text-destaque hover:text-titulo">
          Criar cadastro
        </Link>
      </p>
    </main>
  )
}
