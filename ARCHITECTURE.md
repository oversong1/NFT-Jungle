# Arquitetura

## Visão geral

Vite + React 19 + TypeScript, sem backend real. A API REST, a sessão, os
pedidos e os eventos de tempo real são simulados de modo consistente por MSW
(`msw/browser`) e por um binding Socket.IO sobre o mesmo Service Worker
(`@mswjs/socket.io-binding`), para que o app funcione de ponta a ponta —
inclusive publicado — sem depender de nenhum serviço externo.

Organização de `src/`:

- `aplicacao/` — rotas (TanStack Router), layout raiz, provedores globais e as
  páginas (uma por tela do enunciado).
- `componentes/` — `ui/` (primitivas, ex. `Botao`) e `compostos/` (peças
  reaproveitadas entre páginas: cartão de NFT, campo de texto, painel da
  conta, moldura de sessão, rodapé, paginação).
- `funcionalidades/` — um módulo por domínio (`catalogo`, `carrinho`,
  `pedidos`, `perfil`, `carteiras`, `sessao`, `tempo-real`), cada um com sua
  camada de API (Axios), seus hooks do TanStack Query e suas regras de
  formulário (Zod + React Hook Form quando há formulário).
- `biblioteca/` — utilitários transversais: cliente Axios único
  (`http.ts`), fábrica de chaves de consulta (`chaves-consulta.ts`) e
  aritmética decimal de ETH (`dinheiro.ts`).
- `mocks/` — o "servidor" simulado: fixtures determinísticas, handlers REST
  por domínio, o banco em memória persistido em `localStorage`, os
  cenários de demonstração/teste e a ponte de tempo real.
- `tipos/` — `dominio.ts` (entidades) e `api.ts` (somente os dois contratos
  transversais, `Paginacao<T>` e `ErroApi` — ver Faxina de contratos).

## Contratos de API

Todo recurso que participa de tempo real (`Nft`, `Pedido`, `Carteira`) traz
`id`, `versao` (inteiro, incrementado a cada mutação) e `atualizadoEm`. A
`versao` é o que permite ao cliente descartar eventos atrasados ou duplicados
sem precisar comparar timestamps.

**ETH nunca é `number`.** Preço, subtotal, desconto, taxa e total trafegam
como string decimal (`"1.19"`, `"0.999000"`) tanto na ida quanto na volta.
Toda aritmética passa por `decimal.js` — no "servidor" simulado
(`mocks/apoio.ts#calcularCotacao`) e no cliente (`biblioteca/dinheiro.ts`).
Quantidade é sempre inteiro positivo, validado no handler.

Listagens paginadas usam o envelope único `Paginacao<T>` (`itens`, `pagina`,
`porPagina`, `total`, `totalPaginas`). Todo erro — de validação, de conflito
ou de autenticação — usa o formato único `ErroApi` (`status`, `codigo`,
`mensagem`, `campos?`); é para esse formato que o interceptor do Axios
normaliza qualquer falha (`biblioteca/http.ts#normalizarErro`), inclusive
falha de rede e timeout, para que o resto da aplicação nunca precise
conhecer `AxiosError`.

## Sessão

Token Bearer simulado (`Authorization: Bearer <token>`), guardado em
`localStorage` (`kurio.token`) e injetado pelo interceptor de requisição.
`useSessao` revalida a sessão com `staleTime: 0`, então trocar de aba e
voltar descobre uma expiração rapidamente. Um `401` numa requisição que
**levava token** dispara o evento global `kurio:sessao-expirada`
(`biblioteca/http.ts`); os `Provedores` escutam esse evento, limpam o cache
privado e navegam para `/entrar` preservando o destino atual em
`?redirect=`. Um `401` de login (sem token) é só credencial errada — não
dispara nada. Logout e troca de usuário limpam as chaves prefixadas com
`'privado'` (ver Cache) antes de gravar a sessão nova, para que nada do
usuário anterior vaze para o próximo.

## Carrinho e cotação

Cada carrinho pertence a uma identidade: `usuario:<id>` quando há sessão, ou
`anonimo:<uuid>` (gerado uma vez e persistido em `localStorage`) para
visitantes — a mesma regra é aplicada em `identidadeDoCarrinho` no cliente e
em `identidadeDaRequisicao` no mock, lendo o cabeçalho `x-identidade-anonima`
que o interceptor sempre envia. No login, o carrinho anônimo é mesclado ao
carrinho do usuário (somando quantidades, limitado ao estoque disponível) e
a identidade anônima é descartada — ela não "volta" depois de um logout.

O cupom escolhido vive na URL (`?cupom=`), então sobrevive a um F5 e viaja
naturalmente para `/pagamento`. `POST /api/cotacao` é o único ponto de
cálculo de subtotal, desconto, taxa de rede e total — a mesma função
(`calcularCotacao`) é reaproveitada na criação do pedido, para que o recibo
seja um snapshot do mesmo cálculo que a pessoa viu.

## Cache e chaves de consulta

`biblioteca/chaves-consulta.ts` é a única fábrica de chaves do TanStack
Query. Toda chave que carrega dado de um usuário autenticado começa com o
prefixo `'privado'` (favoritos, pedidos, perfil, carteiras) e
`limparCachePrivado` remove exatamente essas chaves — usado no logout, na
troca de usuário e na sessão expirada. `staleTime` padrão de 30s
(`aplicacao/cliente-consultas.ts`), com exceções para dados que mudam a todo
momento: carrinho e cotação usam `staleTime: 0`. Toda mutação de carrinho
invalida carrinho **e** cotações juntos (`useInvalidarCarrinho`), como um
único padrão reaproveitado por definir/remover item. A política de retry
global não tenta de novo erros `4xx` (são definitivos), mas tenta erros de
rede/`5xx` até duas vezes.

## Eventos de tempo real

Um barramento em memória (`mocks/eventos.ts`) faz o papel do servidor: os
handlers REST emitem nele quando mudam um recurso, e `mocks/tempo-real.ts` faz
a ponte para um canal MSW WebSocket usando `@mswjs/socket.io-binding`,
reemitindo com os nomes públicos do contrato (`nft.updated`, `order.updated`)
dentro de um envelope `{ recursoId, versao, emitidoEm, dados }`
(`funcionalidades/tempo-real/contratos.ts`). O cliente usa
`socket.io-client` com `transports: ['websocket']` — obrigatório, porque o
binding só intercepta o transporte WebSocket, não a sondagem HTTP inicial do
Socket.IO.

`useTempoReal` (montado uma vez em `Provedores`) valida cada evento com Zod,
descarta o que é igual ou mais antigo que a versão em cache (nunca regride a
tela) e, para pedidos, ignora eventos de outro usuário. Na reconexão
(`socket.io.on('reconnect', ...)`), a reconciliação é sempre feita pelo REST
— o evento é só um sinal para invalidar, nunca a fonte de verdade do estado
completo. **Limitação conhecida:** por depender só do transporte WebSocket
do binding, não há um caminho de *fallback* por polling caso o WebSocket seja
bloqueado pela rede.

## Idempotência de pedidos

Cada tentativa de compra tem uma chave (`crypto.randomUUID()`) guardada em
`sessionStorage` junto com um hash do conteúdo (itens + cupom + carteira).
Conteúdo igual reaproveita a mesma chave — um clique duplo ou um F5 durante o
processamento reenvia com a chave idêntica. No servidor simulado,
`idempotencia[chave]` guarda `{ pedidoId, hash }`: mesma chave e mesmo hash
devolve o pedido já criado (nunca duplica); mesma chave com hash diferente
responde `409 CHAVE_REUTILIZADA`. O cenário `timeout-pos-criacao` simula a
resposta se perdendo depois de o pedido já ter nascido no servidor — o
reenvio com a mesma chave recupera o mesmo pedido em vez de criar outro.

O desfecho (aprovado/recusado) é assíncrono (`agendarDesfecho`, 2.5s ou 8s no
cenário `pedido-atrasado`) e chega por `order.updated` com uma consulta
`refetchInterval` de reforço enquanto o status é `'processando'`. Aprovação
baixa o estoque e remove do carrinho **somente** a quantidade comprada;
recusa preserva carrinho e estoque intactos. O recibo (`Pedido.recibo`) é
gravado no momento da criação e nunca é recalculado — uma mudança de preço
depois da compra não altera um recibo já emitido.

## Regras de conta

Um handler garante que cada usuário tenha **no máximo uma** carteira
principal: criar a primeira carteira já a torna principal; promover outra
rebaixa a anterior na mesma escrita; tentar rebaixar a única principal
existente (sem promover outra primeiro) responde `422`; excluir a principal
com outras carteiras disponíveis responde `409 PRINCIPAL_PROTEGIDA`. O
avatar é validado no cliente (tipo e tamanho, `funcionalidades/perfil/
esquemas.ts`) e persistido como *data URL* no banco simulado — não há
upload real. A troca de senha nunca ecoa a senha: `POST /api/perfil/senha`
responde `204` sem corpo.

## Decisões visuais e substituições de assets

A paleta (fundo `#140d0a`, texto `#cfb28c`, ação `#d28a4c`...) vem das
capturas de referência em `Desafio Jungle/nota.txt` e está centralizada em
`src/index.css` como propriedades customizadas, remapeadas para o Tailwind
v4 via `@theme inline`. Não há acervo de arte real de NFTs disponível: as
capas do catálogo reaproveitam um pequeno conjunto de fotos de exemplo
(`public/assets/nfts/*.jpg`) ciclando entre as 24 fixtures — a mesma imagem
aparece em NFTs diferentes de propósito, priorizando fidelidade de layout
sobre variedade de imagem.

## Limitações conhecidas

- **Perfil e Carteiras** ainda usam os tokens de cor genéricos da fundação
  visual (`bg-superficie`, `--raio-cartao` arredondado) da Fase 3, em vez do
  visual mais "achatado" e mais escuro que o Catálogo/Início ganhou depois,
  ao ser ajustado contra as capturas de referência. Funcionalmente estão
  completas; visualmente ficaram um passo atrás do restante do app.
- O filtro de **rede** no painel de filtros rotula "Solana" mas aplica o
  valor `arbitrum` (não existe rede Solana no domínio) — resíduo do texto de
  referência do layout; os outros dois rótulos (Ethereum/Polygon) mapeiam
  corretamente.
- A gaveta de filtros do mobile (`<dialog>`) não devolve o foco
  explicitamente ao botão "Filtros" que a abriu quando é fechada — o
  navegador não garante isso por padrão para `<dialog>`, e o código não
  chama `.focus()` no gatilho ao fechar.
- **Sem suíte de Lighthouse nesta rodada**: as metas de performance/
  acessibilidade/boas práticas/SEO do enunciado (90/95/95/90) não foram
  medidas neste ambiente porque a auditoria precisa de um navegador real
  contra o build de produção servido localmente, o que este ambiente de
  execução não tem como fazer. Rode `npm run build && npm run preview` e
  `npx lighthouse` localmente antes da entrega final, e registre as
  medianas nesta seção.
- **Baselines visuais ainda não geradas**: `testes/visual.spec.ts` existe,
  mas os arquivos de referência (`*.png`) precisam ser gerados uma vez, na
  máquina que vai rodar a suíte, com `npm run atualizar-baselines` — eles
  dependem de fonte/anti-aliasing do sistema operacional onde nasceram.
- `EsqueletoCartaoNft` e o cartão de NFT ganharam recentemente `isolate` e
  `[contain:paint]` como proteção contra um artefato de composição do Chrome
  (conteúdo de outra parte da página "vazando" visualmente para dentro do
  cartão) observado neste ambiente — não foi encontrada nenhuma causa no
  código-fonte para esse sintoma; tudo indica um artefato de renderização
  do navegador em ambiente remoto/VM, não um bug de lógica.
