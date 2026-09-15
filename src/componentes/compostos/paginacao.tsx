import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'

type PropriedadesPaginacao = {
  pagina: number
  totalPaginas: number
  aoMudar: (pagina: number) => void
}

export function Paginacao({ pagina, totalPaginas, aoMudar }: PropriedadesPaginacao) {
  if (totalPaginas <= 1) return null
  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1)
  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-8 flex items-center justify-end gap-1"
    >
      <Botao
        type="button"
        variante="secundaria"
        tamanho="icone"
        className="h-6 min-h-6 min-w-6 rounded-none border-[#714326] p-0"
        disabled={pagina <= 1}
        aria-label="Página anterior"
        onClick={() => aoMudar(pagina - 1)}
      >
        <ChevronLeft size={13} />
      </Botao>
      {paginas.map((numero) => (
        <button
          key={numero}
          type="button"
          aria-current={numero === pagina ? 'page' : undefined}
          onClick={() => aoMudar(numero)}
          className={`grid h-6 w-6 place-items-center text-[10px] font-bold ${numero === pagina ? 'bg-acao text-[#160d09]' : 'border border-[#714326] text-[#d7b692] hover:text-acao'}`}
        >
          {numero}
        </button>
      ))}
      <Botao
        type="button"
        variante="secundaria"
        tamanho="icone"
        className="h-6 min-h-6 min-w-6 rounded-none border-[#714326] p-0"
        disabled={pagina >= totalPaginas}
        aria-label="Próxima página"
        onClick={() => aoMudar(pagina + 1)}
      >
        <ChevronRight size={13} />
      </Botao>
    </nav>
  )
}
