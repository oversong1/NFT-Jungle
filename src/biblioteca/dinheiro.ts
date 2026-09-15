import Decimal from 'decimal.js'

const expressaoDecimal = /^\d+(\.\d{1,18})?$/

function paraDecimal(valor: string): Decimal {
  if (!expressaoDecimal.test(valor)) {
    throw new Error(`Valor ETH inválido: "${valor}"`)
  }
  return new Decimal(valor)
}

/** Multiplica preço unitário (string) por quantidade inteira. Nunca usa number para o valor. */
export function multiplicarEth(precoUnitario: string, quantidade: number): string {
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    throw new Error(`Quantidade inválida: ${quantidade}`)
  }
  return paraDecimal(precoUnitario).mul(quantidade).toFixed(6)
}

/** Compara valores numéricos: "0.30" e "0.3" são iguais, ao contrário de ===. */
export function ethSaoIguais(a: string, b: string): boolean {
  return paraDecimal(a).comparedTo(paraDecimal(b)) === 0
}

/** Formatação de exibição: até 6 casas, sem zeros à direita desnecessários. */
export function formatarEth(valor: string): string {
  return `${paraDecimal(valor).toDecimalPlaces(6).toString()} ETH`
}
