/** Envelope padrão de listagens paginadas. */
export type Paginacao<T> = {
  itens: T[]
  pagina: number
  porPagina: number
  total: number
  totalPaginas: number
}

/** Formato único de erro que toda a aplicação conhece. */
export type ErroApi = {
  status: number
  codigo: string
  mensagem: string
  /** Erros associados a campos de formulário, ex.: { email: 'E-mail já cadastrado' } */
  campos?: Record<string, string>
}
