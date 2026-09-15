import { expect, test } from '@playwright/test'

import { definirCenario, entrar, resetarMundo } from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
})

test('compra por teclado: incluir no carrinho e confirmar sem usar o mouse', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'O fluxo de teclado é verificado no viewport desktop.')

  await entrar(page, 'aline')
  await page.goto('/nfts/nft-01')

  await page.getByRole('button', { name: 'Incluir no carrinho' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status').filter({ hasText: /incluído/i })).toBeVisible()

  await page.goto('/pagamento')
  await page.getByRole('button', { name: 'Confirmar pedido' }).focus()
  await page.keyboard.press('Enter')

  await expect(page.getByText(/pagamento aprovado/i)).toBeVisible({ timeout: 15_000 })
})

test('gaveta de filtros mobile abre com o botão Filtros e fecha com Fechar filtros', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'A gaveta de filtros só existe no viewport mobile.')

  await page.goto('/')
  const botaoFiltros = page.getByRole('button', { name: 'Filtros' })
  await botaoFiltros.click()

  const gaveta = page.getByRole('dialog', { name: /filtros do catálogo/i })
  await expect(gaveta).toBeVisible()

  await gaveta.getByRole('button', { name: 'Fechar filtros' }).click()
  await expect(gaveta).toBeHidden()
})

test('cenário "lento" mostra skeletons antes do catálogo real', async ({ page }) => {
  await definirCenario(page, 'lento')
  await page.goto('/')

  await expect(page.getByRole('status', { name: 'Carregando NFT' }).first()).toBeVisible()
  await expect(page.locator('img[alt^="Arte do NFT"]').first()).toBeVisible({
    timeout: 10_000,
  })
})

test('falha de rede no detalhe do NFT mostra "Tentar novamente"', async ({ page }) => {
  await definirCenario(page, 'sem-conexao')
  await page.goto('/nfts/nft-01')

  await expect(page.getByRole('heading', { name: 'Erro ao carregar o NFT' })).toBeVisible(
    {
      timeout: 15_000,
    },
  )
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
})
