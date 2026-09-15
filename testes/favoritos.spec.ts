import { expect, test } from '@playwright/test'

import { definirCenario, entrar, resetarMundo } from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
  await entrar(page, 'aline')
})

test('favoritar e desfavoritar um NFT persiste após recarregar a página', async ({
  page,
}) => {
  await page.goto('/nfts/nft-01')
  const botaoFavoritar = page.getByRole('button', { name: 'Favoritar' })

  await botaoFavoritar.click()
  await expect(page.getByRole('button', { name: 'Favoritado' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.reload()
  await expect(page.getByRole('button', { name: 'Favoritado' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.getByRole('button', { name: 'Favoritado' }).click()
  await expect(page.getByRole('button', { name: 'Favoritar' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('falha da API ao favoritar desfaz a atualização otimista', async ({ page }) => {
  await page.goto('/nfts/nft-01')
  await definirCenario(page, 'sem-conexao')

  await page.getByRole('button', { name: 'Favoritar' }).click()

  // A mutação otimista muda a UI na hora; como o servidor falha (sem-conexao),
  // o rollback deve devolver o botão ao estado original.
  await expect(page.getByRole('button', { name: 'Favoritar' })).toHaveAttribute(
    'aria-pressed',
    'false',
    { timeout: 10_000 },
  )
})
