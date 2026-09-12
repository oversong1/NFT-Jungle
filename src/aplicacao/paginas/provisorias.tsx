import { Link, useParams, useSearch } from '@tanstack/react-router'

type PropriedadesPaginaProvisoria = {
  titulo: string
  descricao: string
}

function PaginaProvisoria({ titulo, descricao }: PropriedadesPaginaProvisoria) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">
        {titulo}
      </h1>
      <p className="mt-4 text-texto">{descricao}</p>
    </section>
  )
}

export function PaginaDetalheNft() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })

  return (
    <PaginaProvisoria
      titulo={`NFT ${nftId}`}
      descricao="O detalhe completo será, consultando a API pelo id da URL."
    />
  )
}

export function PaginaCarrinho() {
  return (
    <PaginaProvisoria titulo="Carrinho" descricao="Itens, quantidades e cotação em ETH" />
  )
}

export function PaginaPagamento() {
  return (
    <PaginaProvisoria
      titulo="Pagamento"
      descricao="Rota privada. O fluxo de pagamento simulado será implementado"
    />
  )
}

export function PaginaConfirmacaoPedido() {
  const { orderId } = useParams({ from: '/pedido/$orderId/confirmacao' })

  return (
    <PaginaProvisoria
      titulo={`Pedido ${orderId}`}
      descricao="Rota privada. O recibo com snapshot de valores será implementado"
    />
  )
}

export function PaginaEntrar() {
  const busca = useSearch({ from: '/entrar' })

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight text-titulo">Entrar</h1>
      <p className="mt-4 text-texto">
        O formulário real de login chega na Fase 6, com React Hook Form e Zod.
      </p>
      {busca.redirect ? (
        <p className="mt-2 text-sm text-texto-suave">
          Após entrar, você voltará para: <code>{busca.redirect}</code>
        </p>
      ) : null}
      <p className="mt-6 text-sm text-texto">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-bold text-destaque hover:text-titulo">
          Criar cadastro
        </Link>
      </p>
    </section>
  )
}

export function PaginaCadastro() {
  return (
    <PaginaProvisoria
      titulo="Criar conta"
      descricao="O formulário real de cadastro com validação campo a campo."
    />
  )
}

export function PaginaPerfil() {
  return (
    <PaginaProvisoria
      titulo="Perfil"
      descricao="Rota privada. Dados da conta serão implementados"
    />
  )
}

export function PaginaCarteiras() {
  return (
    <PaginaProvisoria
      titulo="Carteiras"
      descricao="Rota privada. Gestão de carteiras será implementada"
    />
  )
}

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

      {/* @ts-expect-error */}
      <Link
        to="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-acao px-5 text-sm font-bold text-fundo hover:bg-destaque"
      >
        Voltar ao catálogo
      </Link>
    </section>
  )
}
