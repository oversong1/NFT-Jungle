import { Link } from '@tanstack/react-router'

import { useSair, useSessao } from '@/funcionalidades/sessao/usar-sessao'

export function MenuSessao() {
  const sessao = useSessao()
  const sairMutation = useSair()

  if (sessao.data) {
    return (
      <div className="ml-auto flex items-center gap-4">
        <span className="text-texto">Olá, {sessao.data.usuario.nome}</span>
        <button
          type="button"
          onClick={() => sairMutation.mutate()}
          disabled={sairMutation.isPending}
          className="font-bold text-destaque hover:text-titulo disabled:opacity-50"
        >
          {sairMutation.isPending ? 'Saindo…' : 'Sair'}
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/entrar"
      className="ml-auto font-bold hover:text-titulo [&.active]:text-destaque"
    >
      Entrar
    </Link>
  )
}
