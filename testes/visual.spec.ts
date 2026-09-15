import { expect, test } from '@playwright/test'

import { entrar, estabilizar, resetarMundo } from './utilitarios/preparacao'

/**
 * Baselines congelam a aparência de início, detalhe, carrinho e pagamento.
 * Gere/atualize com `npm run atualizar-baselines` (só após revisar o diff no
 * relatório do Playwright) e commite os arquivos de `testes/` junto da
 * mudança visual intencional que os causou — nunca só para o teste passar.
 */
test.describe('@visual regressão visual', () => {
  test.beforeEach(async ({ page }) => {
    await resetarMundo(page)
    // Desliga o shimmer de carregamento e as transições para estabilizar os pixels.
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('início', async ({ page }) => {
    await page.goto('/')
    await estabilizar(page)
    await expect(page).toHaveScreenshot('inicio.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })

  test('detalhe', async ({ page }) => {
    await page.goto('/nfts/nft-01')
    await estabilizar(page)
    await expect(page).toHaveScreenshot('detalhe.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })

  test('carrinho', async ({ page }) => {
    await entrar(page, 'aline')
    await page.goto('/nfts/nft-01')
    await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
    await page.goto('/carrinho')
    await estabilizar(page)
    await expect(page).toHaveScreenshot('carrinho.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })

  test('pagamento', async ({ page }) => {
    await entrar(page, 'aline')
    await page.goto('/nfts/nft-01')
    await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
    await page.goto('/pagamento')
    await estabilizar(page)
    await expect(page).toHaveScreenshot('pagamento.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    })
  })
})
