import { handlersCarrinho } from '@/mocks/handlers/carrinho'
import { handlersCatalogo } from '@/mocks/handlers/catalogo'
import { handlersConta } from '@/mocks/handlers/conta'
import { handlersFavoritos } from '@/mocks/handlers/favoritos'
import { handlersPedidos } from '@/mocks/handlers/pedidos'
import { handlersSessao } from '@/mocks/handlers/sessao'

export const todosHandlers = [
  ...handlersSessao,
  ...handlersCatalogo,
  ...handlersFavoritos,
  ...handlersCarrinho,
  ...handlersPedidos,
  ...handlersConta,
]
