import { expect, test } from '@playwright/test'

import { resetarMundo } from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
})

/**
 * O FormularioFiltros existe duas vezes no DOM (aside lateral no desktop e
 * <dialog> na gaveta mobile) — escolhe o contêiner visível do viewport atual.
 */
function areaDeFiltros(page: import('@playwright/test').Page, isMobile: boolean) {
  return isMobile
    ? page.getByRole('dialog', { name: /filtros do catálogo/i })
    : page.getByRole('complementary', { name: /filtros do catálogo/i })
}

test('filtro de coleção fica na URL, some da lista de chips ao limpar', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')

  if (isMobile) {
    await page.getByRole('button', { name: 'Filtros' }).click()
  }
  const area = areaDeFiltros(page, isMobile)

  await area.getByRole('button', { name: 'Fotografia' }).click()
  await expect(page).toHaveURL(/categoria=fotografia/)
  await expect(page).toHaveURL(/pagina=1/)

  // O chip do filtro ativo aparece na lista de "Todos os NFTs".
  await expect(page.getByRole('button', { name: /Categoria: Fotografia/ })).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(/categoria=fotografia/)

  await page.getByRole('button', { name: /Categoria: Fotografia/ }).click()
  await expect(page).not.toHaveURL(/categoria=fotografia/)
})

test('ordenação por menor preço fica na URL e reseta a página', async ({ page }) => {
  await page.goto('/?pagina=2')
  await page
    .getByRole('combobox', { name: 'Ordenar resultados' })
    .selectOption('preco-crescente')

  await expect(page).toHaveURL(/ordenacao=preco-crescente/)
  await expect(page).toHaveURL(/pagina=1/)
})

test('busca por nome filtra o catálogo e reflete na URL', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Buscar NFT').fill('Sage Nomad')
  await page.getByRole('button', { name: 'Ir' }).click()

  await expect(page).toHaveURL(/q=Sage/)
  await expect(page.getByRole('link', { name: /Sage Nomad/ }).first()).toBeVisible()
})

test('voltar do navegador restaura filtros anteriores', async ({ page }) => {
  await page.goto('/?rede=ethereum&pagina=2')
  await page
    .getByRole('combobox', { name: 'Ordenar resultados' })
    .selectOption('nome')
  await expect(page).toHaveURL(/ordenacao=nome/)

  await page.goBack()
  await expect(page).toHaveURL(/rede=ethereum/)
  await expect(page).toHaveURL(/pagina=2/)
})

test('paginação avança para a página seguinte e troca os itens exibidos', async ({
  page,
}) => {
  await page.goto('/')
  const imagensCatalogo = page.locator('img[alt^="Arte do NFT"]')
  await expect(imagensCatalogo.first()).toBeVisible()
  const altPagina1 = await imagensCatalogo.first().getAttribute('alt')

  await page.getByRole('button', { name: 'Próxima página' }).click()
  await expect(page).toHaveURL(/pagina=2/)

  await expect(imagensCatalogo.first()).toBeVisible()
  const altPagina2 = await imagensCatalogo.first().getAttribute('alt')
  expect(altPagina2).not.toBe(altPagina1)
})

test('detalhe inexistente mostra erro amigável, não tela quebrada', async ({ page }) => {
  await page.goto('/nfts/id-que-nao-existe')
  await expect(page.getByRole('heading', { name: /não encontrado/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /voltar ao catálogo/i })).toBeVisible()
})
