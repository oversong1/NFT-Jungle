import { http, HttpResponse } from 'msw'

import { erroApi } from '@/mocks/apoio'
import { obterBanco, reiniciarBanco, salvarBanco } from '@/mocks/armazenamento'
import { cenariosDisponiveis, definirCenario, type Cenario } from '@/mocks/cenarios'
import { servidorEventos } from '@/mocks/eventos'
import { derrubarConexoes, suspenderEmissao } from '@/mocks/tempo-real'

type ComandoDeEvento = {
  comando:
    | 'nft-preco'
    | 'nft-esgotar'
    | 'evento-antigo'
    | 'evento-duplicado'
    | 'derrubar-conexao'
    | 'permitir-conexao'
  nftId?: string
  precoEth?: string
}

export const handlersDesenvolvimento = [
  /** Dispara mutações de dado + eventos correspondentes (painel e testes). */
  http.post('/api/dev/eventos', async ({ request }) => {
    const corpo = (await request.json()) as ComandoDeEvento
    const banco = obterBanco()
    const nft = banco.nfts.find((registro) => registro.id === (corpo.nftId ?? 'nft-01'))

    switch (corpo.comando) {
      case 'nft-preco': {
        if (!nft) return erroApi(422, 'NFT_INEXISTENTE', 'NFT não encontrado.')
        // Muda o dado E emite: REST e evento contam a mesma história.
        nft.precoEth = corpo.precoEth ?? '0.999000'
        nft.versao += 1
        nft.atualizadoEm = new Date().toISOString()
        salvarBanco()
        servidorEventos.emitir('nft:atualizado', nft)
        break
      }
      case 'nft-esgotar': {
        if (!nft) return erroApi(422, 'NFT_INEXISTENTE', 'NFT não encontrado.')
        nft.edicao.disponiveis = 0
        nft.versao += 1
        nft.atualizadoEm = new Date().toISOString()
        salvarBanco()
        servidorEventos.emitir('nft:atualizado', nft)
        break
      }
      case 'evento-antigo': {
        if (!nft) return erroApi(422, 'NFT_INEXISTENTE', 'NFT não encontrado.')
        // Emite versão 1 SEM mudar o banco: o cliente deve ignorar.
        servidorEventos.emitir('nft:atualizado', { ...nft, versao: 1 })
        break
      }
      case 'evento-duplicado': {
        if (!nft) return erroApi(422, 'NFT_INEXISTENTE', 'NFT não encontrado.')
        // Reemite a versão atual: o cliente deve ignorar (>= versão em cache).
        servidorEventos.emitir('nft:atualizado', { ...nft })
        break
      }
      case 'derrubar-conexao': {
        suspenderEmissao(true)
        derrubarConexoes()
        break
      }
      case 'permitir-conexao': {
        suspenderEmissao(false)
        break
      }
      default:
        return erroApi(422, 'COMANDO_DESCONHECIDO', 'Comando de evento desconhecido.')
    }

    return HttpResponse.json({ executado: corpo.comando })
  }),

  /** Reset completo das fixtures — usado pela suíte de testes de ponta a ponta. */
  http.post('/api/dev/reset', () => {
    reiniciarBanco()
    definirCenario('padrao')
    return HttpResponse.json({ executado: 'reset' })
  }),

  /** Ativa um cenário nomeado por requisição (equivalente ao window.kurio). */
  http.post('/api/dev/cenario', async ({ request }) => {
    const corpo = (await request.json()) as { cenario?: string }
    if (!cenariosDisponiveis.includes(corpo.cenario as Cenario)) {
      return erroApi(422, 'CENARIO_DESCONHECIDO', `Cenário inválido: ${corpo.cenario}`)
    }
    definirCenario(corpo.cenario as Cenario)
    return HttpResponse.json({ executado: `cenario:${corpo.cenario}` })
  }),
]
