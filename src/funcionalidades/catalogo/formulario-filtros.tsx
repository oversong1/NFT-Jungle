import { useMemo, useState } from 'react'

import { Botao } from '@/componentes/ui/botao'
import type { FiltrosCatalogo } from '@/funcionalidades/catalogo/esquema-filtros'

type PropriedadesFormularioFiltros = {
  prefixoId: string
  filtros: FiltrosCatalogo
  aoAplicar: (novos: Partial<FiltrosCatalogo>) => void
  aoLimpar: () => void
}

const colecoes = [
  ['Arte digital', 'arte', '33'],
  ['Fotografia', 'fotografia', '12'],
  ['Música', 'musica', '65'],
  ['Arte 3D', 'colecionaveis', '39'],
  ['Colecionáveis', 'colecionaveis', '23'],
  ['Generativa', 'arte', '17'],
  ['Jogos', 'colecionaveis', '19'],
  ['Assinaturas', 'colecionaveis', '13'],
  ['Utilidade', 'colecionaveis', '18'],
] as const

const redes = [
  ['Ethereum', 'ethereum', '119'],
  ['Polygon', 'polygon', '78'],
  ['Solana', 'arbitrum', '86'],
] as const

function paraNumero(valor: string | undefined, padrao: number) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : padrao
}

export function FormularioFiltros({
  prefixoId,
  filtros,
  aoAplicar,
  aoLimpar,
}: PropriedadesFormularioFiltros) {
  const [minimo, definirMinimo] = useState(() => paraNumero(filtros.precoMin, 0.02))
  const [maximo, definirMaximo] = useState(() => paraNumero(filtros.precoMax, 12.3))
  const intervalo = useMemo(
    () => `${minimo.toFixed(2)} – ${maximo.toFixed(2)} ETH`,
    [minimo, maximo],
  )

  function aplicarPreco() {
    aoAplicar({ precoMin: minimo.toFixed(2), precoMax: maximo.toFixed(2) })
  }

  return (
    <div className="space-y-7 text-[11px] leading-4 text-[#cdb28d]">
      <section aria-labelledby={`${prefixoId}-colecoes`}>
        <h2 id={`${prefixoId}-colecoes`} className="mb-2 text-sm font-black text-titulo">
          Coleções
        </h2>
        <ul className="space-y-1">
          {colecoes.map(([rotulo, categoria, total]) => (
            <li key={rotulo}>
              <button
                type="button"
                onClick={() => aoAplicar({ categoria })}
                className={`flex w-full items-center justify-between py-0.5 text-left transition hover:text-acao ${filtros.categoria === categoria ? 'font-bold text-acao' : ''}`}
              >
                <span>{rotulo}</span>
                <span>({total})</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${prefixoId}-preco`}>
        <h2 id={`${prefixoId}-preco`} className="mb-3 text-sm font-black text-titulo">
          Faixa de preço
        </h2>
        <div className="relative h-5">
          <div className="absolute left-0 right-0 top-2 h-[2px] bg-[#9a5a29]" />
          <div
            className="absolute top-2 h-[2px] bg-acao"
            style={{
              left: `${(minimo / 12.3) * 100}%`,
              right: `${100 - (maximo / 12.3) * 100}%`,
            }}
          />
          <input
            id={`${prefixoId}-preco-min`}
            aria-label="Preço mínimo em ETH"
            type="range"
            min="0"
            max="12.3"
            step="0.01"
            value={minimo}
            onChange={(evento) =>
              definirMinimo(Math.min(Number(evento.target.value), maximo - 0.01))
            }
            className="filtro-range absolute inset-0 h-5 w-full"
          />
          <input
            id={`${prefixoId}-preco-max`}
            aria-label="Preço máximo em ETH"
            type="range"
            min="0"
            max="12.3"
            step="0.01"
            value={maximo}
            onChange={(evento) =>
              definirMaximo(Math.max(Number(evento.target.value), minimo + 0.01))
            }
            className="filtro-range absolute inset-0 h-5 w-full"
          />
        </div>
        <p className="mt-1 text-[10px] text-[#cdb28d]">Preço: {intervalo}</p>
        <Botao
          type="button"
          tamanho="pequeno"
          className="mt-2 min-h-7 rounded-[3px] px-3 py-1 text-[10px]"
          onClick={aplicarPreco}
        >
          Aplicar
        </Botao>
      </section>

      <section aria-labelledby={`${prefixoId}-redes`}>
        <h2 id={`${prefixoId}-redes`} className="mb-2 text-sm font-black text-titulo">
          Rede
        </h2>
        <ul className="space-y-1">
          {redes.map(([rotulo, rede, total]) => (
            <li key={rotulo}>
              <button
                type="button"
                onClick={() => aoAplicar({ rede })}
                className={`flex w-full items-center justify-between py-0.5 text-left transition hover:text-acao ${filtros.rede === rede ? 'font-bold text-acao' : ''}`}
              >
                <span>{rotulo}</span>
                <span>({total})</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={aoLimpar}
        className="text-left text-[10px] font-bold text-acao hover:text-titulo"
      >
        Limpar todos os filtros
      </button>
    </div>
  )
}
