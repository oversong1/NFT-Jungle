import axios, { AxiosError } from 'axios'

import { limparToken, obterToken } from '@/funcionalidades/sessao/sessao-local'
import type { ErroApi } from '@/tipos/api'

/** Única instância Axios da aplicação. Nenhum módulo cria outra. */
export const clienteHttp = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Toda requisição sai com o token da sessão, quando existe.
clienteHttp.interceptors.request.use((configuracao) => {
  const token = obterToken()
  if (token) {
    configuracao.headers.Authorization = `Bearer ${token}`
  }
  return configuracao
})

/**
 * Converte qualquer falha (rede, timeout, HTTP) para o formato único
 * ErroApi = { status, codigo, mensagem, campos }. O resto da aplicação
 * nunca toca em AxiosError.
 */
export function normalizarErro(erro: unknown): ErroApi {
  if (erro instanceof AxiosError) {
    const corpo = erro.response?.data as Partial<ErroApi> | undefined

    if (corpo?.codigo && corpo?.mensagem) {
      return {
        status: erro.response?.status ?? 0,
        codigo: corpo.codigo,
        mensagem: corpo.mensagem,
        campos: corpo.campos,
      }
    }

    if (erro.code === 'ECONNABORTED') {
      return {
        status: 0,
        codigo: 'TEMPO_ESGOTADO',
        mensagem: 'O servidor demorou demais para responder. Tente novamente.',
      }
    }

    return {
      status: erro.response?.status ?? 0,
      codigo: 'FALHA_DE_REDE',
      mensagem: 'Não foi possível conectar. Verifique sua internet.',
    }
  }

  return {
    status: 0,
    codigo: 'ERRO_DESCONHECIDO',
    mensagem: 'Algo inesperado aconteceu. Tente novamente.',
  }
}

clienteHttp.interceptors.response.use(
  (resposta) => resposta,
  (erro: AxiosError) => {
    const normalizado = normalizarErro(erro)

    // 401 em requisição QUE LEVAVA TOKEN significa sessão expirada.
    // 401 no login (sem token) é só credencial errada — não dispara nada.
    const levavaToken = Boolean(erro.config?.headers?.Authorization)

    if (normalizado.status === 401 && levavaToken) {
      limparToken()
      window.dispatchEvent(new CustomEvent('kurio:sessao-expirada'))
    }

    return Promise.reject(normalizado)
  },
)
