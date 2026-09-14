import { delay, HttpResponse } from 'msw'

export const cenariosDisponiveis = [
  'padrao',
  'vazio',
  'lento',
  'sem-conexao',
  'sessao-expirada',
  'conflito-cadastro',
  'preco-alterado',
  'edicao-esgotada',
  'pedido-atrasado',
  'pedido-aprovado',
  'pedido-recusado',
] as const

export type Cenario = (typeof cenariosDisponiveis)[number]

const CHAVE_CENARIO = 'kurio.mock.cenario'

export function obterCenario(): Cenario {
  const valor = localStorage.getItem(CHAVE_CENARIO)
  return cenariosDisponiveis.includes(valor as Cenario) ? (valor as Cenario) : 'padrao'
}

export function definirCenario(cenario: Cenario): void {
  if (!cenariosDisponiveis.includes(cenario)) {
    throw new Error(`Cenário desconhecido: ${cenario}`)
  }
  localStorage.setItem(CHAVE_CENARIO, cenario)
}

/**
 * Passo inicial de todo handler: aplica a latência do cenário e devolve
 * uma resposta pronta quando o cenário derruba a requisição inteira.
 */
export async function iniciarRequisicao(): Promise<{
  cenario: Cenario
  respostaImediata: Response | null
}> {
  const cenario = obterCenario()

  await delay(cenario === 'lento' ? 2500 : 300)

  if (cenario === 'sem-conexao') {
    // HttpResponse.error() simula falha de rede: o Axios recebe erro
    // sem status HTTP, como se o cabo tivesse sido desconectado.
    return { cenario, respostaImediata: HttpResponse.error() }
  }

  return { cenario, respostaImediata: null }
}
