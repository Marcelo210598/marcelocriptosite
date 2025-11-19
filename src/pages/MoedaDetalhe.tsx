import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fetchCoinDetailSafe, fetchMarketChartSafe, type CoinDetail } from '../services/coingecko-safe'

function useCurrencyFormatter(vs: 'usd' | 'brl' | 'eur') {
  return useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: vs.toUpperCase() }), [vs])
}

function Sparkline({ data }: { data: number[] }) {
  const width = 480
  const height = 80
  const padding = 6
  if (!data || data.length === 0) return <div className="text-xs text-zinc-500">Sem dados de sparkline</div>
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (width - padding * 2) / (data.length - 1)
  const points = data.map((v, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })
  const rising = data[data.length - 1] >= data[0]
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block">
      <polyline points={points.join(' ')} fill="none" stroke={rising ? '#34d399' : '#f87171'} strokeWidth={2} />
    </svg>
  )
}

function ChartLine({ points, width = 640, height = 200 }: { points: [number, number][]; width?: number; height?: number }) {
  const padding = 8
  if (!points || points.length === 0) return <div className="text-xs text-zinc-500">Sem dados de histórico</div>
  const values = points.map((p) => p[1])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (width - padding * 2) / (points.length - 1)
  const rising = values[values.length - 1] >= values[0]
  const path = points
    .map((p, i) => {
      const x = padding + i * stepX
      const y = height - padding - ((p[1] - min) / range) * (height - padding * 2)
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  const [hover, setHover] = React.useState<{ idx: number; x: number; y: number } | null>(null)

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.target as SVGElement).closest('svg')!.getBoundingClientRect()
    const x = e.clientX - rect.left
    let idx = Math.round((x - padding) / stepX)
    idx = Math.max(0, Math.min(points.length - 1, idx))
    const px = padding + idx * stepX
    const py = height - padding - ((points[idx][1] - min) / range) * (height - padding * 2)
    setHover({ idx, x: px, y: py })
  }

  const onLeave = () => setHover(null)

  const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} onMouseMove={onMove} onMouseLeave={onLeave}>
        <path d={path} fill="none" stroke={rising ? '#34d399' : '#f87171'} strokeWidth={2} />
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="#a78bfa" strokeDasharray="3 3" />
            <circle cx={hover.x} cy={hover.y} r={3} fill="#a78bfa" />
          </g>
        )}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white"
          style={{ left: hover.x, top: hover.y - 30 }}
        >
          <div>{dateFmt.format(new Date(points[hover.idx][0]))}</div>
          <div className="font-mono">{points[hover.idx][1].toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}

export default function MoedaDetalhe(): React.JSX.Element {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [vs, setVs] = useState<'usd' | 'brl' | 'eur'>(() => {
    const p = (searchParams.get('vs') ?? 'usd').toLowerCase()
    return ['usd','brl','eur'].includes(p) ? (p as any) : 'usd'
  })
  const nfCurrency = useCurrencyFormatter(vs)
  const [rangeDays, setRangeDays] = useState<1 | 7 | 30>(() => {
    const r = Number(searchParams.get('range') ?? 7)
    return (r === 1 || r === 7 || r === 30) ? (r as 1 | 7 | 30) : 7
  })

  const [coin, setCoin] = useState<CoinDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState<boolean>(false)
  const [fav, setFav] = useState<boolean>(false)
  const [chart, setChart] = useState<[number, number][]>([])
  const [chartLoading, setChartLoading] = useState<boolean>(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [isChartMock, setIsChartMock] = useState<boolean>(false)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    fetchCoinDetailSafe(id)
      .then((result) => {
        if (!active) return
        setCoin(result.data)
        setIsMockData(result.isMock)
        setError(null)
        
        if (result.error) {
          console.warn('Aviso:', result.error)
        }
      })
      .catch((e) => {
        if (!active) return
        setError(e?.message ?? 'Falha ao carregar moeda')
        setCoin(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => { active = false }
  }, [id])

  // Load market chart when id/vs/range changes
  useEffect(() => {
    if (!id) return
    let active = true
    setChartLoading(true)
    setChartError(null)
    fetchMarketChartSafe({ id, vsCurrency: vs, days: rangeDays })
      .then((result) => {
        if (!active) return
        setChart(result.data.prices)
        setIsChartMock(result.isMock)
        
        if (result.error) {
          console.warn('Aviso gráfico:', result.error)
        }
      })
      .catch((e) => {
        if (!active) return
        setChartError(e?.message ?? 'Falha ao carregar histórico')
        setChart([])
      })
      .finally(() => {
        if (!active) return
        setChartLoading(false)
      })
    return () => { active = false }
  }, [id, vs, rangeDays])

  // Sync URL with vs/range changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('vs', vs)
    params.set('range', String(rangeDays))
    setSearchParams(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vs, rangeDays])

  // init favorite state
  useEffect(() => {
    try {
      const raw = localStorage.getItem('favorites_coins')
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      setFav(arr.includes(id ?? ''))
    } catch {}
  }, [id])

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem('favorites_coins')
      let arr = raw ? (JSON.parse(raw) as string[]) : []
      if (fav) arr = arr.filter((x) => x !== id)
      else arr.push(id as string)
      localStorage.setItem('favorites_coins', JSON.stringify(arr))
      setFav((v) => !v)
    } catch {}
  }

  const price = coin?.current_price?.[vs]
  const mc = coin?.market_cap?.[vs]
  const vol = coin?.total_volume?.[vs]

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{coin ? coin.name : 'Moeda'}</h2>
        <Link to={`/market?vs=${vs}`} className="text-sm text-indigo-300 hover:text-indigo-200">← Voltar ao Market</Link>
      </div>
      <p className="mt-2 text-zinc-400">Detalhes em tempo real via CoinGecko.</p>
      
      {isMockData && (
        <div className="p-4 mb-6 bg-yellow-900 border border-yellow-700 text-yellow-200 rounded">
          ⚠️ Você está visualizando dados de demonstração. A API está temporariamente indisponível.
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <img src={coin?.image} alt={coin?.name} className="h-10 w-10 rounded-full" />
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-white">{coin?.name}</span>
          <span className="font-mono text-sm text-zinc-400">{coin?.symbol?.toUpperCase()}</span>
          <button
            className={`ml-2 text-lg ${fav ? 'text-yellow-400' : 'text-zinc-600'} hover:text-yellow-300`}
            onClick={toggleFavorite}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            {fav ? '★' : '☆'}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-zinc-400">Moeda:</label>
          <select value={vs} onChange={(e) => setVs(e.target.value as any)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white">
            <option value="usd">USD</option>
            <option value="brl">BRL</option>
            <option value="eur">EUR</option>
          </select>
          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm text-zinc-400">Intervalo:</label>
            <select value={rangeDays} onChange={(e) => setRangeDays(Number(e.target.value) as any)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white">
              <option value={1}>24h</option>
              <option value={7}>7d</option>
              <option value={30}>30d</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="mt-6 text-sm text-zinc-400">Carregando detalhes…</div>}
      {error && (
        <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">Erro: {error}</div>
      )}

      {!loading && !error && coin && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <div className="text-sm text-zinc-400">Preço</div>
            <div className="mt-1 text-2xl font-bold">{price != null ? nfCurrency.format(price) : '—'}</div>
            <div className={`mt-2 text-sm ${ (coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' }`}>
              {coin.price_change_percentage_24h?.toFixed(2)}% (24h)
            </div>
          </div>
          <div className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <div className="text-sm text-zinc-400">Capitalização</div>
            <div className="mt-1 text-xl">{mc != null ? nfCurrency.format(mc) : '—'}</div>
          </div>
          <div className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <div className="text-sm text-zinc-400">Volume (24h)</div>
            <div className="mt-1 text-xl">{vol != null ? nfCurrency.format(vol) : '—'}</div>
          </div>
        </div>
      )}

      {/* Gráfico histórico */}
      {!loading && !error && coin && (
        <div className="mt-8 rounded border border-zinc-700 bg-zinc-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-zinc-400">Histórico ({rangeDays === 1 ? '24h' : rangeDays === 7 ? '7 dias' : '30 dias'})</div>
            {chartLoading && <div className="text-xs text-zinc-500">Carregando gráfico…</div>}
          </div>
          {isChartMock && (
            <div className="mb-2 p-2 rounded border border-yellow-700 bg-yellow-900/50 text-xs text-yellow-200">
              📊 Gráfico de demonstração - API de histórico indisponível
            </div>
          )}
          {chartError && <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">{chartError}</div>}
          {!chartError && chart.length > 0 ? (
            <ChartLine points={chart} />
          ) : (
            <Sparkline data={coin.sparkline_7d ?? []} />
          )}
        </div>
      )}

      {!loading && !error && coin && coin.description && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Sobre</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{coin.description}</p>
        </div>
      )}
    </section>
  )
}