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
  'timeout-pos-criacao',
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

/** Sorteia um atraso dentro da faixa — é isso que permite respostas saírem
 * fora de ordem: duas requisições disparadas em sequência podem terminar em
 * qualquer ordem, exercitando o mesmo jeito que uma rede real se comporta
 * (e o motivo de todo recurso versionado descartar resposta atrasada). */
function atrasoAleatorioEntre(minimoMs: number, maximoMs: number): number {
  return minimoMs + Math.random() * (maximoMs - minimoMs)
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

  await delay(
    cenario === 'lento'
      ? atrasoAleatorioEntre(1800, 3200)
      : atrasoAleatorioEntre(150, 450),
  )

  if (cenario === 'sem-conexao') {
    // HttpResponse.error() simula falha de rede: o Axios recebe erro
    // sem status HTTP, como se o cabo tivesse sido desconectado.
    return { cenario, respostaImediata: HttpResponse.error() }
  }

  return { cenario, respostaImediata: null }
}
