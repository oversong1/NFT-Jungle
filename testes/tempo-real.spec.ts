import { expect, test } from '@playwright/test'

import {
  definirCenario,
  dispararEvento,
  entrar,
  resetarMundo,
} from './utilitarios/preparacao'

test.beforeEach(async ({ page }) => {
  await resetarMundo(page)
})

test('evento de preço com o item no carrinho atualiza o resumo e avisa na linha', async ({
  page,
}) => {
  await entrar(page, 'aline')
  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()

  await page.goto('/carrinho')
  // Captura o preço "visto" ao abrir a tela.
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()

  await dispararEvento(page, 'nft-preco', { nftId: 'nft-01', precoEth: '0.999000' })

  await expect(
    page.getByText('O preço deste NFT mudou. A cotação ao lado já usa o preço atual.'),
  ).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('0.999 ETH').first()).toBeVisible()
})

test('evento antigo e evento duplicado não regridem a tela', async ({ page }) => {
  await entrar(page, 'aline')
  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await page.goto('/carrinho')
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()

  await dispararEvento(page, 'nft-preco', { nftId: 'nft-01', precoEth: '0.999000' })
  await expect(page.getByText('0.999 ETH').first()).toBeVisible({ timeout: 10_000 })

  // evento-antigo reemite versão 1 sem tocar o banco: preço não pode voltar.
  await dispararEvento(page, 'evento-antigo', { nftId: 'nft-01' })
  await expect(page.getByText('0.999 ETH').first()).toBeVisible()
  await expect(page.getByText('1.19 ETH')).toHaveCount(0)

  // evento-duplicado reemite a versão atual: idempotente, sem regressão.
  await dispararEvento(page, 'evento-duplicado', { nftId: 'nft-01' })
  await expect(page.getByText('0.999 ETH').first()).toBeVisible()
})

test('pedido pendente é retomado após recarregar a página', async ({ page }) => {
  await definirCenario(page, 'pedido-atrasado')
  await entrar(page, 'aline')
  await page.goto('/nfts/nft-01')
  await page.getByRole('button', { name: 'Incluir no carrinho' }).click()
  await page.goto('/pagamento')
  await page.getByRole('button', { name: 'Confirmar pedido' }).click()

  await expect(page.getByText(/processando pagamento/i)).toBeVisible()

  await page.reload()
  // A tentativa fica salva no sessionStorage: o acompanhamento retoma sozinho.
  await expect(page.getByText(/processando pagamento/i)).toBeVisible()

  await expect(page.getByText(/pagamento aprovado/i)).toBeVisible({ timeout: 15_000 })
})
