import { expect, test } from '@playwright/test'

import { definirCenario, entrar, resetarMundo, usuarios } from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
})

test('cadastro com e-mail já existente mostra o erro no campo, sem apagar os dados', async ({
  page,
}) => {
  await definirCenario(page, 'conflito-cadastro')
  await page.goto('/cadastro')

  await page.getByLabel('Nome').fill('Visitante Teste')
  await page.getByLabel('E-mail').fill('visitante@kurio.dev')
  await page.getByLabel('Senha', { exact: true }).fill('SenhaForte@123')
  await page.getByLabel('Repita a senha').fill('SenhaForte@123')
  await page.getByRole('button', { name: 'Criar conta' }).click()

  await expect(page.getByText('Este e-mail já possui conta.')).toBeVisible()
  // Permanece na tela de cadastro, com os dados digitados intactos.
  await expect(page).toHaveURL(/\/cadastro/)
  await expect(page.getByLabel('Nome')).toHaveValue('Visitante Teste')
})

test('login redireciona de volta à página protegida que originou o /entrar', async ({
  page,
}) => {
  // /perfil exige sessão: sem token, a guarda de rota manda para /entrar
  // preservando o destino em ?redirect=.
  await page.goto('/perfil')
  await expect(page).toHaveURL(/\/entrar\?redirect=/)

  await page.getByLabel('E-mail').fill(usuarios.aline.email)
  await page.getByLabel('Senha', { exact: true }).fill(usuarios.aline.senha)
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/perfil$/)
  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible()
})

test('sessão expirada durante navegação manda para /entrar preservando o destino', async ({
  page,
}) => {
  await entrar(page, 'aline')
  await definirCenario(page, 'sessao-expirada')

  await page.goto('/perfil')
  await expect(page).toHaveURL(/\/entrar\?redirect=.*perfil/, { timeout: 15_000 })
})

test('logout limpa a sessão: nav volta a mostrar "Entrar" e áreas privadas exigem login de novo', async ({
  page,
}) => {
  await entrar(page, 'aline')

  await page.getByRole('button', { name: /^Sair$/ }).click()
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()

  await page.goto('/perfil')
  await expect(page).toHaveURL(/\/entrar\?redirect=/)
})
