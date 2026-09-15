# Kurio — Marketplace NFT

Aplicação frontend para um marketplace de NFTs, construída com React, TypeScript, TanStack Router, TanStack Query, Axios, MSW e Socket.IO. A API é simulada no próprio navegador pelo MSW; não existe dependência de backend externo.

Decisões de arquitetura, contratos de API, regras de negócio e limitações conhecidas estão documentadas em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

- Demonstração pública: _preencher após o deploy (ex.: https://kurio.vercel.app)_
- Enunciado do desafio: https://github.com/junglegaming/frontend-challenge

## Requisitos

- Node.js 22.12 ou superior (ou Docker + Docker Compose)
- npm 10 ou superior

## Rodar com Docker

Pré-requisito: Docker Desktop instalado e em execução.

```bash
docker compose up --build
```

Abra [http://localhost:8080](http://localhost:8080). Para encerrar:

```bash
docker compose down
```

O comando constrói uma imagem de produção, serve a aplicação com Nginx e inclui o arquivo do Service Worker. As rotas diretas também funcionam, pois o Nginx redireciona caminhos do frontend para `index.html`.

## Rodar localmente

Pré-requisito: Node.js 22.12 ou superior.

```bash
npm ci
npm run dev
```

Aplicação em [http://localhost:5173](http://localhost:5173) com mocks ativos.

## Variáveis de ambiente

| Variável | Padrão | Efeito |
| --- | --- | --- |
| `VITE_USAR_MOCKS` | `true` (dev e produção, ver `.env.production`) | Liga o MSW e o transporte simulado de eventos em tempo real |

## Cenários simulados

O backend simulado (MSW) tem cenários nomeados que forçam comportamentos específicos —
úteis para validar estados de erro, latência e fluxos de pagamento sem precisar
manipular dados manualmente:

```
padrao, vazio, lento, sem-conexao, sessao-expirada, conflito-cadastro,
preco-alterado, edicao-esgotada, pedido-atrasado, pedido-aprovado,
pedido-recusado, timeout-pos-criacao
```

Ativação, por qualquer uma das duas vias:

```js
// console do navegador
kurio.definirCenario('lento')
location.reload()
```

```bash
# ajuste a porta conforme como a aplicação está rodando:
# 5173 (npm run dev), 8080 (Docker) ou 4173 (npm run preview)
curl -X POST http://localhost:5173/api/dev/cenario \
  -H "Content-Type: application/json" \
  -d '{"cenario":"lento"}'
```

Eventos de tempo real de demonstração (preço mudou, edição esgotou, etc.) ficam
disponíveis no painel flutuante **"Demonstração"** (canto inferior direito da tela)
ou via `POST /api/dev/eventos`.

## Reset dos dados

O estado simulado (usuários, carrinhos, pedidos, carteiras) vive em `localStorage`
(`kurio.mock.bd.v3`). Para voltar ao estado inicial:

```js
// console do navegador
kurio.reiniciarBanco()
location.reload()
```

Ou por requisição: `POST /api/dev/reset`. A suíte de testes E2E já faz esse reset
automaticamente antes de cada caso (`testes/utilitarios/preparacao.ts`).

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | desenvolvimento, com mocks ativos |
| `npm run build` | build de produção (mocks ativos) |
| `npm run preview` | serve o build gerado em http://localhost:4173 |
| `npm run verificar-tipos` | checagem de tipos (`tsc -b`, inclui `testes/`) |
| `npm run lint` | análise estática (oxlint) |
| `npm run formatar` / `verificar-formato` | formatação (prettier --write / --check) |
| `npm run testar` | suíte Playwright completa (desktop + mobile) |
| `npm run testar-ui` | suíte em modo interativo |
| `npm run testar-visual` | somente a regressão visual (`@visual`) |
| `npm run atualizar-baselines` | regrava as baselines visuais (só após revisar o diff) |

## Testes

A suíte Playwright (`testes/`) cobre catálogo, sessão, favoritos, carrinho,
pagamento, perfil/carteiras, tempo real e acessibilidade, em dois projetos
(desktop e mobile). Ela roda contra o build de produção com mocks ativos —
o próprio Playwright constrói e serve a aplicação em `http://127.0.0.1:4173`
antes de começar (ver `playwright.config.ts`).

```bash
npm run testar          # suíte completa (desktop + mobile)
npm run testar-ui       # modo interativo, útil ao escrever/depurar um teste
npm run testar-visual   # somente a regressão visual (@visual)
```

### Regressão visual

`testes/visual.spec.ts` compara _screenshots_ de início, detalhe, carrinho e
pagamento contra baselines commitadas em `testes/`. As baselines **ainda não
foram geradas** nesta entrega — gere-as uma vez, localmente, antes de rodar a
suíte pela primeira vez:

```bash
npm run atualizar-baselines
git add testes
```

Baselines são específicas do sistema operacional onde nasceram (fontes e
anti-aliasing diferem); gere e atualize sempre na mesma máquina. Quando um
teste visual falhar depois disso: abra o relatório do Playwright, veja o
diff lado a lado e decida — mudança **intencional** → `npm run
atualizar-baselines` de novo e commite a baseline junto da mudança que a
causou; **não intencional** → é regressão, corrija o código. Nunca atualize
a baseline só para o teste passar.

## Auditoria Lighthouse

Não medida nesta entrega — precisa de um navegador real contra o build de
produção local, o que este ambiente de desenvolvimento assistido não tinha
como fazer. Antes da entrega final, rode localmente e preencha a tabela:

```bash
npm run build
npm run preview
npx lighthouse http://localhost:4173/ --output html --output-path relatorios/inicio-mobile.html
```

| Página  | Modo    | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| ------- | ------- | ----------- | -------------- | ------------- | --- | --- | --- | --- |
| Início  | mobile  | —           | —              | —             | —   | —   | —   | —   |
| Início  | desktop | —           | —              | —             | —   | —   | —   | —   |
| Detalhe | mobile  | —           | —              | —             | —   | —   | —   | —   |
| Detalhe | desktop | —           | —              | —             | —   | —   | —   | —   |

Metas do desafio: performance ≥ 90, acessibilidade ≥ 95, boas práticas ≥ 95, SEO ≥ 90.

## Contas de demonstração

- E-mail: `aline@kurio.dev` / Senha: `Kurio@123` (possui carteira principal)
- E-mail: `bruno@kurio.dev` / Senha: `Kurio@123` (sem carteiras cadastradas)

## Funcionalidades

- catálogo com busca, filtros, ordenação, paginação e detalhe do NFT;
- favoritos, carrinho de visitante, cupom e cotação em ETH com valores decimais;
- login, cadastro, perfil, avatar, senha e gestão de carteiras;
- pagamento idempotente, recibo imutável e cenários de aprovação, recusa e timeout;
- atualizações em tempo real de NFT e pedido;
- navegação responsiva, menu móvel, teclado, estados de carregamento e feedback acessível.

## Deploy (Vercel)

O repositório já inclui um `vercel.json` com o rewrite necessário para que rotas do
TanStack Router (ex.: `/nfts/nft-01`, `/carrinho`) funcionem com URL direta e com
refresh (F5) em produção — sem ele, essas rotas retornariam 404 por serem
resolvidas no cliente.

Ao importar o repositório na Vercel:

1. Framework preset: **Vite**.
2. Build command: `npm run build` (já definido em `vercel.json`).
3. Output directory: `dist` (já definido em `vercel.json`).
4. Nenhuma variável de ambiente extra é necessária — `.env.production` já define
   `VITE_USAR_MOCKS=true`, então o build publicado sobe com o MSW simulando a API.

Depois do deploy, valide em uma janela anônima: catálogo, detalhe de um NFT com URL
direta, login com a conta de demonstração e refresh em uma rota interna.
