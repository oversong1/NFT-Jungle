import { LogIn, LogOut, UserRound } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useSair, useSessao } from '@/funcionalidades/sessao/usar-sessao'

export function MenuSessao() {
  const sessao = useSessao()
  const sairMutation = useSair()

  if (sessao.data) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/perfil"
          className="inline-flex h-9 items-center gap-1.5 px-2 text-[10px] font-bold text-titulo hover:text-acao"
        >
          <UserRound size={15} />
          {sessao.data.usuario.nome.split(' ')[0]}
        </Link>
        <button
          type="button"
          onClick={() => sairMutation.mutate()}
          disabled={sairMutation.isPending}
          className="inline-flex h-8 items-center gap-1 border border-[#754625] px-2 text-[10px] font-bold text-acao hover:bg-[#2d1b13] disabled:opacity-50"
        >
          <LogOut size={13} />
          {sairMutation.isPending ? 'Saindo' : 'Sair'}
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/entrar"
      className="inline-flex h-8 items-center gap-1 rounded-[4px] bg-acao px-3 text-[10px] font-black text-[#160d09] hover:bg-destaque"
    >
      <LogIn size={13} />
      Entrar
    </Link>
  )
}
