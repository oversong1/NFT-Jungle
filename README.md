# Kurio — Marketplace NFT

Aplicação frontend para um marketplace de NFTs, construída com React, TypeScript, TanStack Router, TanStack Query, Axios, MSW e Socket.IO. A API é simulada no próprio navegador pelo MSW; não existe dependência de backend externo.

Decisões de arquitetura, contratos de API, regras de negócio e limitações conhecidas estão documentadas em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

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

## Verificações

```bash
npm run verificar-tipos
npm run lint
npm run build
npm run testar
```

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

`testes/visual.spec.ts` compara *screenshots* de início, detalhe, carrinho e
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

| Página | Modo | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Início | mobile | — | — | — | — | — | — | — |
| Início | desktop | — | — | — | — | — | — | — |
| Detalhe | mobile | — | — | — | — | — | — | — |
| Detalhe | desktop | — | — | — | — | — | — | — |

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
