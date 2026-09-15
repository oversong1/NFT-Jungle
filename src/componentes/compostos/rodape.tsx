import { AtSign, BadgeCheck, Camera, MessageCircle, Play } from 'lucide-react'

const colunas = [
  {
    titulo: 'Meu perfil',
    itens: [
      'Meu perfil',
      'Minha coleção',
      'Atividade',
      'Estúdio do criador',
      'Lista de interesse',
    ],
  },
  {
    titulo: 'Central de ajuda',
    itens: [
      'Central de ajuda',
      'Como comprar NFTs',
      'Carteira e segurança',
      'Política do mercado',
      'Denunciar item',
    ],
  },
  {
    titulo: 'Coleções',
    itens: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'],
  },
]

const beneficios = [
  {
    sigla: 'W',
    titulo: 'Segurança da carteira',
    texto: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    sigla: 'C',
    titulo: 'Criadores em destaque',
    texto:
      'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    sigla: 'D',
    titulo: 'Alertas de lançamentos',
    texto: 'Receba calendários de cunhagem, novidades e listas de acesso.',
  },
]

export function Rodape() {
  return (
    <footer className="mx-auto mt-20 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <section className="grid bg-[#27150f] lg:grid-cols-[repeat(3,minmax(0,1fr))_1.2fr]">
        {beneficios.map((beneficio) => (
          <article
            key={beneficio.sigla}
            className="border-b border-[#9c5d2b]/50 px-7 py-8 last:border-b-0 lg:border-b-0 lg:border-r"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-acao text-base font-black text-[#160d09]">
              {beneficio.sigla}
            </span>
            <h2 className="mt-4 text-base font-bold text-titulo">{beneficio.titulo}</h2>
            <p className="mt-2 max-w-52 text-xs leading-5 text-[#c7a77f]">
              {beneficio.texto}
            </p>
          </article>
        ))}
        <section className="px-7 py-8">
          <h2 className="max-w-52 text-base font-bold leading-4 text-titulo">
            Antecipe-se ao próximo lançamento
          </h2>
          <form className="mt-4 flex" onSubmit={(evento) => evento.preventDefault()}>
            <label className="sr-only" htmlFor="email-rodape">
              E-mail
            </label>
            <input
              id="email-rodape"
              type="email"
              placeholder="Digite seu e-mail..."
              className="min-w-0 flex-1 border border-[#5d341d] bg-[#190e09] px-3 py-2 text-xs text-titulo placeholder:text-[#aa8257]"
            />
            <button
              type="submit"
              className="bg-acao px-4 text-xs font-black text-[#160d09]"
            >
              Enviar
            </button>
          </form>
          <p className="mt-3 text-xs leading-5 text-[#c7a77f]">
            Receba lançamentos selecionados, histórias de criadores e novidades do
            mercado.
          </p>
        </section>
      </section>

      <section className="grid gap-5 bg-[#40230d] px-7 py-5 text-xs text-[#f4e5d2] sm:grid-cols-2 lg:grid-cols-4">
        <strong className="text-xs uppercase tracking-[0.16em]">Kurio</strong>
        <p>
          Feito para colecionadores,
          <br />
          criadores e cultura
        </p>
        <p>contato@email.com</p>
        <p>+55 11 4002 8922</p>
      </section>

      <section className="grid gap-8 bg-[#27150f] px-7 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {colunas.map((coluna) => (
          <section key={coluna.titulo}>
            <h2 className="text-base font-bold text-titulo">{coluna.titulo}</h2>
            <ul className="mt-3 space-y-2 text-xs text-[#e5d2bc]">
              {coluna.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h2 className="text-base font-bold text-titulo">Redes sociais</h2>
          <div className="mt-3 flex gap-2">
            {[AtSign, Camera, MessageCircle, BadgeCheck, Play].map((Icone) => (
              <span
                key={Icone.displayName}
                className="grid h-7 w-7 place-items-center rounded border border-acao text-acao"
              >
                <Icone size={14} />
              </span>
            ))}
          </div>
          <h3 className="mt-5 text-sm font-bold text-titulo">Carteiras compatíveis</h3>
          <p className="mt-2 inline-block rounded border border-[#81511f] px-2 py-1 text-[9px] font-bold text-acao">
            METAMASK · WALLETCONNECT · COINBASE
          </p>
        </section>
      </section>
      <p className="py-4 text-center text-[10px] text-[#e5d2bc]">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  )
}
