import { Botao } from '@/componentes/ui/botao'

type PropriedadesPaginacao = {
  pagina: number
  totalPaginas: number
  aoMudar: (pagina: number) => void
}

export function Paginacao({ pagina, totalPaginas, aoMudar }: PropriedadesPaginacao) {
  if (totalPaginas <= 1) return null

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-10 flex items-center justify-center gap-4"
    >
      <Botao
        type="button"
        variante="secundaria"
        tamanho="pequeno"
        disabled={pagina <= 1}
        onClick={() => aoMudar(pagina - 1)}
      >
        Anterior
      </Botao>
      <p className="text-sm text-texto" aria-current="page">
        Página {pagina} de {totalPaginas}
      </p>
      <Botao
        type="button"
        variante="secundaria"
        tamanho="pequeno"
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudar(pagina + 1)}
      >
        Próxima
      </Botao>
    </nav>
  )
}
