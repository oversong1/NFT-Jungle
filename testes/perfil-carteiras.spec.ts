import { expect, test } from '@playwright/test'

import { entrar, resetarMundo } from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
  await entrar(page, 'aline')
})

test('editar o nome no perfil persiste após recarregar a página', async ({ page }) => {
  await page.goto('/perfil')

  const campoNome = page.getByLabel('Nome completo')
  await campoNome.fill('Aline Souza Atualizada')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(page.getByText('Perfil atualizado.')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Nome completo')).toHaveValue('Aline Souza Atualizada')
  // O cabeçalho lê a sessão: o primeiro nome exibido também deve mudar.
  await expect(page.getByRole('link', { name: 'Aline' })).toBeVisible()
})

test('senha atual incorreta mostra o erro junto do campo', async ({ page }) => {
  await page.goto('/perfil')

  await page.getByLabel('Senha atual').fill('SenhaErrada@000')
  await page.getByLabel('Nova senha').fill('NovaSenha@123')
  await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123')
  await page.getByRole('button', { name: 'Alterar senha' }).click()

  await expect(page.getByText('A senha atual está incorreta.')).toBeVisible()
})

test('troca de senha bem-sucedida limpa os campos e confirma na tela', async ({
  page,
}) => {
  await page.goto('/perfil')

  await page.getByLabel('Senha atual').fill('Kurio@123')
  await page.getByLabel('Nova senha').fill('NovaSenha@123')
  await page.getByLabel('Confirmar nova senha').fill('NovaSenha@123')
  await page.getByRole('button', { name: 'Alterar senha' }).click()

  await expect(page.getByText('Senha alterada.')).toBeVisible()
  await expect(page.getByLabel('Senha atual')).toHaveValue('')
})

test('nova carteira cadastrada aparece como opção no checkout', async ({ page }) => {
  await page.goto('/carteiras')
  await page.getByRole('button', { name: 'Adicionar carteira' }).click()

  await page.getByLabel('Apelido').fill('Carteira de testes')
  await page.getByLabel('Endereço').fill('0x1234567890abcdef1234567890abcdef12345678')
  await page.getByRole('button', { name: 'Cadastrar carteira' }).click()

  await expect(page.getByRole('heading', { name: 'Carteira de testes' })).toBeVisible()

  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await page.goto('/pagamento')

  await expect(page.getByText(/Carteira de testes/)).toBeVisible()
})

test('promover uma carteira a principal rebaixa a anterior automaticamente', async ({
  page,
}) => {
  await page.goto('/carteiras')
  // "Carteira principal" (car-1) já vem das fixtures como a principal.
  await expect(page.getByText('Principal', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Adicionar carteira' }).click()
  await page.getByLabel('Apelido').fill('Segunda carteira')
  await page.getByLabel('Endereço').fill('0xabcdef1234567890abcdef1234567890abcdef12')
  await page.getByLabel(/usar como carteira principal/i).check()
  await page.getByRole('button', { name: 'Cadastrar carteira' }).click()

  const cartaoNovo = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Segunda carteira' }) })
  await expect(cartaoNovo.getByText('Principal', { exact: true })).toBeVisible()

  // Continua existindo exatamente uma carteira principal na lista.
  await expect(page.getByText('Principal', { exact: true })).toHaveCount(1)
})
