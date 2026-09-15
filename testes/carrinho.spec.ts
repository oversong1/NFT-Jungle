import { expect, test } from '@playwright/test'

import { entrar, resetarMundo } from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
})

test('incluir, alterar quantidade e remover um item do carrinho', async ({ page }) => {
  await entrar(page, 'aline')

  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await expect(page.getByRole('status').filter({ hasText: /incluído/i })).toBeVisible()

  await page.goto('/carrinho')
  await expect(page.getByRole('heading', { name: 'Carrinho' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ }).first()).toBeVisible()

  await page.getByRole('button', { name: /Aumentar quantidade de Emerald Ape #042/ }).click()
  await expect(page.getByText('2.38 ETH').first()).toBeVisible()

  await page.getByRole('button', { name: /Remover Emerald Ape #042 do carrinho/ }).click()
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
})

test('cupom válido aplica desconto; expirado e inexistente avisam sem apagar os itens', async ({
  page,
}) => {
  await entrar(page, 'aline')
  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await page.goto('/carrinho')

  // O botão "Remover" do cupom tem aria-label próprio (Remover cupom <CODIGO>),
  // que também existe no cupom inválido — por isso identificamos por ele, e
  // não pelo botão homônimo "Remover cupom" que só aparece dentro do alerta
  // de erro do cupom inválido.
  await page.getByLabel('Cupom de desconto').fill('KURIO10')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText(/Desconto \(KURIO10\)/)).toBeVisible()
  await page.getByRole('button', { name: 'Remover cupom KURIO10', exact: true }).click()

  await page.getByLabel('Cupom de desconto').fill('EXPIRADO10')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(
    page.getByText('Cupom inexistente, expirado ou desativado.'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ }).first()).toBeVisible()
  await page
    .getByRole('button', { name: 'Remover cupom EXPIRADO10', exact: true })
    .click()

  await page.getByLabel('Cupom de desconto').fill('NAO-EXISTE')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(
    page.getByText('Cupom inexistente, expirado ou desativado.'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ }).first()).toBeVisible()
})

test('o carrinho sobrevive ao refresh da página', async ({ page }) => {
  await entrar(page, 'aline')
  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()

  await page.goto('/carrinho')
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ }).first()).toBeVisible()

  await page.reload()
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ }).first()).toBeVisible()
})

test('carrinho de visitante é mesclado ao carrinho do usuário no login', async ({
  page,
}) => {
  // Ainda anônimo: inclui um item.
  await page.goto('/nfts/nft-02')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await expect(page.getByRole('status').filter({ hasText: /incluído/i })).toBeVisible()

  // Login: o carrinho do visitante deve aparecer no carrinho da Aline.
  await entrar(page, 'aline')
  await page.goto('/carrinho')
  await expect(page.getByRole('link', { name: /Sage Nomad #009/ }).first()).toBeVisible()
})
