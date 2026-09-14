import { useState, type FormEvent } from 'react'

import { Botao } from '@/componentes/ui/botao'
import {
  categoriasCatalogo,
  raridadesCatalogo,
  redesCatalogo,
  type FiltrosCatalogo,
} from '@/funcionalidades/catalogo/esquema-filtros'
import {
  rotulosCategoria,
  rotulosRaridade,
  rotulosRede,
} from '@/funcionalidades/catalogo/rotulos'

type PropriedadesFormularioFiltros = {
  /** Evita ids duplicados quando o formulário aparece duas vezes na página. */
  prefixoId: string
  filtros: FiltrosCatalogo
  aoAplicar: (novos: Partial<FiltrosCatalogo>) => void
  aoLimpar: () => void
}

export function FormularioFiltros({
  prefixoId,
  filtros,
  aoAplicar,
  aoLimpar,
}: PropriedadesFormularioFiltros) {
  // Estado transitório: existe só enquanto a pessoa digita o preço.
  // A verdade continua sendo a URL; aplicar = navegar.
  const [precoMin, definirPrecoMin] = useState(filtros.precoMin ?? '')
  const [precoMax, definirPrecoMax] = useState(filtros.precoMax ?? '')

  function aoEnviarPreco(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    aoAplicar({
      precoMin: precoMin.trim() === '' ? undefined : precoMin.trim(),
      precoMax: precoMax.trim() === '' ? undefined : precoMax.trim(),
    })
  }

  const classeSelect =
    'w-full rounded-lg border border-[var(--cor-borda)] bg-superficie px-3 py-2.5 text-sm text-titulo'

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor={`${prefixoId}-categoria`}
          className="mb-1.5 block text-sm font-bold text-titulo"
        >
          Categoria
        </label>
        <select
          id={`${prefixoId}-categoria`}
          value={filtros.categoria}
          onChange={(evento) =>
            aoAplicar({ categoria: evento.target.value as FiltrosCatalogo['categoria'] })
          }
          className={classeSelect}
        >
          {categoriasCatalogo.map((opcao) => (
            <option key={opcao} value={opcao}>
              {rotulosCategoria[opcao]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${prefixoId}-rede`}
          className="mb-1.5 block text-sm font-bold text-titulo"
        >
          Rede
        </label>
        <select
          id={`${prefixoId}-rede`}
          value={filtros.rede}
          onChange={(evento) =>
            aoAplicar({ rede: evento.target.value as FiltrosCatalogo['rede'] })
          }
          className={classeSelect}
        >
          {redesCatalogo.map((opcao) => (
            <option key={opcao} value={opcao}>
              {rotulosRede[opcao]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${prefixoId}-raridade`}
          className="mb-1.5 block text-sm font-bold text-titulo"
        >
          Raridade
        </label>
        <select
          id={`${prefixoId}-raridade`}
          value={filtros.raridade}
          onChange={(evento) =>
            aoAplicar({ raridade: evento.target.value as FiltrosCatalogo['raridade'] })
          }
          className={classeSelect}
        >
          {raridadesCatalogo.map((opcao) => (
            <option key={opcao} value={opcao}>
              {rotulosRaridade[opcao]}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={aoEnviarPreco}
        aria-label="Faixa de preço em ETH"
        className="space-y-3"
      >
        <p className="text-sm font-bold text-titulo">Preço (ETH)</p>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${prefixoId}-preco-min`}>
            Preço mínimo em ETH
          </label>
          <input
            id={`${prefixoId}-preco-min`}
            inputMode="decimal"
            placeholder="mín."
            value={precoMin}
            onChange={(evento) => definirPrecoMin(evento.target.value)}
            className={classeSelect}
          />
          <span aria-hidden="true">—</span>
          <label className="sr-only" htmlFor={`${prefixoId}-preco-max`}>
            Preço máximo em ETH
          </label>
          <input
            id={`${prefixoId}-preco-max`}
            inputMode="decimal"
            placeholder="máx."
            value={precoMax}
            onChange={(evento) => definirPrecoMax(evento.target.value)}
            className={classeSelect}
          />
        </div>
        <Botao type="submit" variante="secundaria" tamanho="pequeno">
          Aplicar preço
        </Botao>
      </form>

      <Botao type="button" variante="texto" tamanho="pequeno" onClick={aoLimpar}>
        Limpar todos os filtros
      </Botao>
    </div>
  )
}
