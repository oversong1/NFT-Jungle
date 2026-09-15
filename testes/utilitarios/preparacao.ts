import { expect, type Page } from '@playwright/test'

/**
 * Estado conhecido: limpa banco simulado (localStorage), sessão, identidade
 * anônima e tentativa de pedido (sessionStorage); o próximo carregamento
 * recria as fixtures da `src/mocks/dados/fixtures.ts`.
 */
export async function resetarMundo(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
}

/** Ativa um cenário nomeado (ver `src/mocks/cenarios.ts`), sem recarregar. */
export async function definirCenario(page: Page, cenario: string) {
  await page.evaluate(async (nome) => {
    const resposta = await fetch('/api/dev/cenario', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cenario: nome }),
    })
    if (!resposta.ok) throw new Error(`Falha ao definir cenário: ${nome}`)
  }, cenario)
}

/** Dispara um comando de evento de tempo real (ver `src/mocks/handlers/desenvolvimento.ts`). */
export async function dispararEvento(
  page: Page,
  comando: string,
  extras: Record<string, string> = {},
) {
  await page.evaluate(
    async (corpo) => {
      const resposta = await fetch('/api/dev/eventos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(corpo),
      })
      if (!resposta.ok) throw new Error('Falha ao disparar evento')
    },
    { comando, ...extras },
  )
}

export const usuarios = {
  aline: { email: 'aline@kurio.dev', senha: 'Kurio@123' },
  bruno: { email: 'bruno@kurio.dev', senha: 'Kurio@123' },
} as const

export async function entrar(page: Page, usuario: keyof typeof usuarios) {
  const credenciais = usuarios[usuario]
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill(credenciais.email)
  await page.getByLabel('Senha', { exact: true }).fill(credenciais.senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(
    page.getByRole('navigation', { name: 'Navegação principal' }),
  ).toContainText('Sair')
}

/** Lista os pedidos do usuário logado pela API simulada (verificação decisiva). */
export async function listarPedidosPelaApi(page: Page) {
  return page.evaluate(async () => {
    const resposta = await fetch('/api/pedidos', {
      headers: { authorization: `Bearer ${localStorage.getItem('kurio.token')}` },
    })
    return (await resposta.json()) as Array<{ id: string; status: string }>
  })
}

/** Estabiliza a página para captura visual: sem fontes pendentes nem rede em voo. */
export async function estabilizar(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}
