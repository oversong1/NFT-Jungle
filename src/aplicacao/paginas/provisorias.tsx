import { Link } from '@tanstack/react-router'

import { filtrosPadrao } from '@/funcionalidades/catalogo/esquema-filtros'

export function PaginaNaoEncontrada() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-destaque">
        Erro 404
      </p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-titulo">
        Página não encontrada
      </h1>
      <p className="mt-4 text-texto">O endereço digitado não existe no Kurio.</p>

      <Link
        to="/"
        search={filtrosPadrao}
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-acao px-5 text-sm font-bold text-fundo hover:bg-destaque"
      >
        Voltar ao catálogo
      </Link>
    </section>
  )
}
