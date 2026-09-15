import { z } from 'zod'

/** Envelope comum: identidade estável do recurso + versão + carimbo de emissão. */
const esquemaEnvelope = z.object({
  recursoId: z.string().min(1),
  versao: z.number().int().positive(),
  emitidoEm: z.string(),
})

/**
 * 'dados' é o recurso completo emitido pelo servidor. Validamos os campos
 * que a reconciliação usa; os demais passam adiante (looseObject).
 */
export const esquemaEventoNft = esquemaEnvelope.extend({
  dados: z.looseObject({
    id: z.string().min(1),
    versao: z.number().int().positive(),
    atualizadoEm: z.string(),
    precoEth: z.string(),
    edicao: z.looseObject({
      total: z.number().int(),
      disponiveis: z.number().int().min(0),
    }),
  }),
})

export const esquemaEventoPedido = esquemaEnvelope.extend({
  dados: z.looseObject({
    id: z.string().min(1),
    versao: z.number().int().positive(),
    usuarioId: z.string().min(1),
    status: z.enum(['processando', 'aprovado', 'recusado']),
  }),
})

/** Nomes dos eventos no socket — o contrato público da API de tempo real. */
export const EVENTO_NFT = 'nft.updated'
export const EVENTO_PEDIDO = 'order.updated'
