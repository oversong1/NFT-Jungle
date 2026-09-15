import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { chaves } from '@/biblioteca/chaves-consulta'
import { useSessao } from '@/funcionalidades/sessao/usar-sessao'
import type { Sessao, Usuario } from '@/tipos/dominio'

import { atualizarPerfil, obterPerfil, trocarSenha } from './api-perfil'

export function usePerfil() {
  const sessao = useSessao()
  const usuarioId = sessao.data?.usuario.id

  return useQuery({
    queryKey: chaves.perfil(usuarioId ?? 'anonimo'),
    queryFn: ({ signal }) => obterPerfil(signal),
    enabled: Boolean(usuarioId),
  })
}

export function useAtualizarPerfil() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: atualizarPerfil,
    onSuccess: (usuario: Usuario) => {
      cliente.setQueryData(chaves.perfil(usuario.id), usuario)
      // O cabeçalho lê a sessão: sincroniza o nome sem nova requisição.
      cliente.setQueryData<Sessao>(chaves.sessao, (atual) =>
        atual ? { ...atual, usuario } : atual,
      )
    },
  })
}

export function useTrocarSenha() {
  return useMutation({ mutationFn: trocarSenha })
}
