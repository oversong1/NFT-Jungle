import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { limparCachePrivado } from '@/aplicacao/cliente-consultas'
import { chaves } from '@/biblioteca/chaves-consulta'
import { cadastrar, entrar, obterSessao, sair } from '@/funcionalidades/sessao/api-sessao'
import {
  estaAutenticado,
  limparToken,
  salvarToken,
} from '@/funcionalidades/sessao/sessao-local'
import type { Sessao } from '@/tipos/dominio'

/**
 * Sessão atual. Só consulta quando existe token; revalida ao focar a
 * janela (staleTime 0), descobrindo expiração cedo. O 401 é tratado
 * globalmente pelo interceptor + Provedores.
 */
export function useSessao() {
  return useQuery({
    queryKey: chaves.sessao,
    queryFn: obterSessao,
    enabled: estaAutenticado(),
    staleTime: 0,
  })
}

/** Compartilhado por login e cadastro: ambos terminam com sessão nova. */
function aplicarSessaoNova(cliente: ReturnType<typeof useQueryClient>, sessao: Sessao) {
  // Troca de usuário: limpa o privado ANTES de gravar a sessão nova,
  // para que nada do usuário anterior vaze para o próximo.
  limparCachePrivado(cliente)
  salvarToken(sessao.token)
  cliente.setQueryData(chaves.sessao, sessao)
}

export function useEntrar() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: entrar,
    onSuccess: (sessao) => aplicarSessaoNova(cliente, sessao),
  })
}

export function useCadastrar() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: cadastrar,
    onSuccess: (sessao) => aplicarSessaoNova(cliente, sessao),
  })
}

export function useSair() {
  const cliente = useQueryClient()
  const roteador = useRouter()

  return useMutation({
    mutationFn: sair,
    // onSettled: mesmo se o servidor falhar, a sessão local é encerrada.
    onSettled: () => {
      limparToken()
      limparCachePrivado(cliente)
      void roteador.navigate({ to: '/', search: {} as never })
    },
  })
}
