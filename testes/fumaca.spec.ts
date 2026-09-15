import { expect, test } from '@playwright/test'

async function limparEstado(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await expect(page.getByRole('link', { name: 'KURIO' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await limparEstado(page)
})

test('catálogo exibe NFTs e imagens variadas', async ({ page }) => {
  const imagens = page.locator('img[alt^="Arte do NFT"]')
  await expect(imagens.first()).toBeVisible()
  expect(await imagens.count()).toBeGreaterThan(1)
  const fontes = await imagens.evaluateAll((elementos) =>
    elementos.map((elemento) => elemento.getAttribute('src')),
  )
  expect(new Set(fontes).size).toBeGreaterThan(1)
})

test('login atualiza a navegação sem recarregar a página', async ({ page, isMobile }) => {
  if (isMobile) {
    await page.getByRole('button', { name: 'Abrir menu de navegação' }).click()
  }
  await page.getByRole('link', { name: 'Entrar' }).click()
  await page.locator('#entrar-email').fill('aline@kurio.dev')
  await page.locator('#entrar-senha').fill('Kurio@123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('link', { name: 'Aline' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()
})

test('menu móvel abre e apresenta as rotas principais', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Este cenário é exclusivo do viewport móvel.')
  await page.getByRole('button', { name: 'Abrir menu de navegação' }).click()
  await expect(page.getByRole('link', { name: 'Mercado' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Criadores' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Carrinho com 0 itens/ })).toBeVisible()
})
