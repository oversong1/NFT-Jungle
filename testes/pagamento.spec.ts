import { expect, test, type Page } from '@playwright/test'

import {
  definirCenario,
  dispararEvento,
  entrar,
  listarPedidosPelaApi,
  resetarMundo,
} from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
  // Aline já tem uma carteira principal cadastrada nas fixtures (car-1).
  await entrar(page, 'aline')
})

async function incluirNftNoCarrinho(page: Page) {
  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await expect(page.getByRole('status').filter({ hasText: /incluído/i })).toBeVisible()
  await page.goto('/pagamento')
}

test('compra aprovada de ponta a ponta termina no recibo', async ({ page }) => {
  await incluirNftNoCarrinho(page)
  await page.getByRole('button', { name: 'Confirmar pedido' }).click()

  await expect(page.getByText(/pagamento aprovado/i)).toBeVisible({ timeout: 15_000 })
  await expect(page).toHaveURL(/\/pedido\/.+\/confirmacao/)
})

test('clique repetido em Confirmar pedido não cria dois pedidos', async ({ page }) => {
  await definirCenario(page, 'pedido-atrasado')
  await incluirNftNoCarrinho(page)

  const confirmar = page.getByRole('button', { name: 'Confirmar pedido' })
  await confirmar.click()
  // Se o botão já desabilitou (ou a tela já trocou), o segundo clique nem acontece.
  await confirmar.click({ force: true }).catch(() => undefined)

  await expect(page.getByText(/processando pagamento/i)).toBeVisible()

  const pedidos = await listarPedidosPelaApi(page)
  expect(pedidos).toHaveLength(1)
})

test('timeout após criação recupera o mesmo pedido pela chave de idempotência', async ({
  page,
}) => {
  await definirCenario(page, 'timeout-pos-criacao')
  await incluirNftNoCarrinho(page)

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  // O primeiro POST "cai" (HttpResponse.error()), mas o pedido já nasceu no
  // servidor; o reenvio automático com a MESMA chave recupera o mesmo pedido.
  await expect(page.getByText(/processando pagamento/i)).toBeVisible({ timeout: 15_000 })

  const pedidos = await listarPedidosPelaApi(page)
  expect(pedidos).toHaveLength(1)
})

test('pedido recusado preserva o carrinho', async ({ page }) => {
  await definirCenario(page, 'pedido-recusado')
  await incluirNftNoCarrinho(page)

  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  await expect(page.getByRole('alert').filter({ hasText: /recusado/i })).toBeVisible({
    timeout: 15_000,
  })

  await page.goto('/carrinho')
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ }).first()).toBeVisible()
})

test('recibo é um snapshot: mudança de preço depois da compra não altera o recibo', async ({
  page,
}) => {
  await incluirNftNoCarrinho(page)
  await page.getByRole('button', { name: 'Confirmar pedido' }).click()
  await expect(page.getByText(/pagamento aprovado/i)).toBeVisible({ timeout: 15_000 })

  // Preço no recibo é o de compra (1.19 ETH). Mudar o preço do catálogo
  // depois não pode alterar um recibo já emitido — ele é snapshot.
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()
  await dispararEvento(page, 'nft-preco', { nftId: 'nft-01', precoEth: '9.990000' })
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()
  await expect(page.getByText('9.99 ETH')).toHaveCount(0)
})
