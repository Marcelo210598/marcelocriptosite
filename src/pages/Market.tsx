import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchMarkets, type MarketCoin } from '../services/coingecko'

const nfCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })

export default function Market(): React.JSX.Element {
  const [coins, setCoins] = useState<MarketCoin[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchRaw, setSearchRaw] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'market_cap' | 'price' | 'change' | 'volume' | 'name'>('market_cap')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(25)
  const [vs, setVs] = useState<'usd' | 'brl' | 'eur'>('usd')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false)
  type ColKey = 'price' | 'market_cap' | 'change' | 'volume'
  const [visibleCols, setVisibleCols] = useState<Record<ColKey, boolean>>({
    price: true,
    market_cap: true,
    change: true,
    volume: true,
  })

  const nfCurrency = useMemo(() => {
    const currency = vs.toUpperCase()
    return new Intl.NumberFormat('en-US', { style: 'currency', currency })
  }, [vs])

  useEffect(() => {
    // init from URL
    const q = searchParams.get('q') ?? ''
    const sk = (searchParams.get('sort') ?? 'market_cap') as typeof sortKey
    const sd = (searchParams.get('dir') ?? 'desc') as typeof sortDir
    const pg = Number(searchParams.get('page') ?? 1)
    const pp = Number(searchParams.get('perPage') ?? 25)
    const vsp = (searchParams.get('vs') ?? 'usd').toLowerCase()
    const favp = searchParams.get('fav')
    const colsp = searchParams.get('cols')
    setSearchRaw(q)
    setSearch(q)
    setSortKey(['market_cap','price','change','volume','name'].includes(sk) ? sk : 'market_cap')
    setSortDir(sd === 'asc' ? 'asc' : 'desc')
    setPage(Number.isFinite(pg) && pg > 0 ? pg : 1)
    setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 25)
    setVs(['usd','brl','eur'].includes(vsp) ? (vsp as typeof vs) : 'usd')
    setFavoritesOnly(favp === '1')
    if (colsp) {
      const on = new Set(colsp.split(',').map((s) => s.trim()).filter(Boolean))
      setVisibleCols({
        price: on.has('price'),
        market_cap: on.has('market_cap'),
        change: on.has('change'),
        volume: on.has('volume'),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // load favorites from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('favorites_coins')
      if (raw) {
        const arr = JSON.parse(raw) as string[]
        setFavorites(new Set(arr))
      }
    } catch {}
  }, [])

  // load columns from localStorage if not set via URL
  useEffect(() => {
    const hasColsInUrl = !!searchParams.get('cols')
    if (hasColsInUrl) return
    try {
      const raw = localStorage.getItem('market_visible_cols')
      if (raw) {
        const obj = JSON.parse(raw) as Partial<Record<ColKey, boolean>>
        setVisibleCols((prev) => ({
          price: obj.price ?? prev.price,
          market_cap: obj.market_cap ?? prev.market_cap,
          change: obj.change ?? prev.change,
          volume: obj.volume ?? prev.volume,
        }))
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiOrder = useMemo(() => {
    // CoinGecko supports: market_cap_[asc|desc], volume_[asc|desc], gecko_[asc|desc], id_asc
    // We will map supported keys; unsupported remain client-side.
    const dir = sortDir
    if (sortKey === 'market_cap') return `market_cap_${dir}`
    if (sortKey === 'volume') return `volume_${dir}`
    // name/id_asc only supports asc reliably; skip for consistency
    return undefined
  }, [sortKey, sortDir])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchMarkets({ vsCurrency: vs, perPage, page, order: apiOrder })
      .then((data) => {
        if (!active) return
        setCoins(data)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message ?? 'Falha ao carregar dados')
        setCoins(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, perPage, vs, apiOrder])

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchRaw.trim()), 200)
    return () => clearTimeout(id)
  }, [searchRaw])

  // Sync URL
  useEffect(() => {
    const cols = Object.entries(visibleCols)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',')
    setSearchParams({ q: search || '', sort: sortKey, dir: sortDir, page: String(page), perPage: String(perPage), vs, fav: favoritesOnly ? '1' : '0', cols })
  }, [search, sortKey, sortDir, page, perPage, vs, favoritesOnly, visibleCols, setSearchParams])

  // persist visible columns
  useEffect(() => {
    try {
      localStorage.setItem('market_visible_cols', JSON.stringify(visibleCols))
    } catch {}
  }, [visibleCols])

  // Auto-adjust sort if the current sort key becomes hidden
  useEffect(() => {
    const isVisible = (key: typeof sortKey) => {
      if (key === 'name') return true // "Moeda" coluna sempre visível
      const k = key as ColKey
      return !!visibleCols[k]
    }
    if (!isVisible(sortKey)) {
      const fallbackOrder: Array<typeof sortKey> = ['market_cap', 'price', 'volume', 'change', 'name']
      const next = fallbackOrder.find((k) => isVisible(k)) ?? 'name'
      if (next !== sortKey) {
        setSortKey(next)
        if (next === 'name') setSortDir('desc')
      }
    }
  }, [visibleCols, sortKey])

  const filteredSorted = useMemo(() => {
    const arr = (coins ?? []).filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    })
    const arrFav = favoritesOnly ? arr.filter((c) => favorites.has(c.id)) : arr
    const sortClient = !(sortKey === 'market_cap' || sortKey === 'volume')
    const compare = (a: MarketCoin, b: MarketCoin) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'market_cap':
          return dir * (a.market_cap - b.market_cap)
        case 'price':
          return dir * (a.current_price - b.current_price)
        case 'change':
          return dir * (a.price_change_percentage_24h - b.price_change_percentage_24h)
        case 'volume':
          return dir * ((a.total_volume ?? 0) - (b.total_volume ?? 0))
        case 'name':
          return dir * a.name.localeCompare(b.name)
        default:
          return 0
      }
    }
    return sortClient ? arrFav.sort(compare) : arrFav
  }, [coins, search, sortKey, sortDir, favoritesOnly, favorites])

  const changeSort = (key: typeof sortKey) => {
    setSortKey(key)
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem('favorites_coins', JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-2xl font-bold">Moedas</h2>
      <p className="mt-2 text-zinc-400">Dados em tempo real via CoinGecko.</p>

      {/* Controles */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={searchRaw}
          onChange={(e) => setSearchRaw(e.target.value)}
          placeholder="Buscar por nome ou símbolo"
          className="w-full sm:w-1/2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Moeda:</label>
            <select
              value={vs}
              onChange={(e) => setVs(e.target.value as typeof vs)}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
            >
              <option value="usd">USD</option>
              <option value="brl">BRL</option>
              <option value="eur">EUR</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Por página:</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Só favoritos
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Colunas:</span>
            {(['price','market_cap','change','volume'] as ColKey[]).map((key) => (
              <label key={key} className="flex items-center gap-1 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={visibleCols[key]}
                  onChange={(e) => setVisibleCols((prev) => ({ ...prev, [key]: e.target.checked }))}
                />
                {key === 'price' ? 'Preço' : key === 'market_cap' ? 'MarketCap' : key === 'change' ? '24h' : 'Volume'}
              </label>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-6 text-sm text-zinc-400">Carregando dados de mercado…</div>
      )}
      {error && (
        <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          Erro: {error}
        </div>
      )}

      {!loading && !error && coins && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-900/60 text-zinc-300">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Moeda</th>
                {visibleCols.price && (
                  <th className="px-4 py-2 cursor-pointer" onClick={() => changeSort('price')}>
                    Preço {sortKey === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                )}
                {visibleCols.market_cap && (
                  <th className="px-4 py-2 cursor-pointer" onClick={() => changeSort('market_cap')}>
                    MarketCap {sortKey === 'market_cap' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                )}
                {visibleCols.change && (
                  <th className="px-4 py-2 cursor-pointer" onClick={() => changeSort('change')}>
                    24h {sortKey === 'change' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                )}
                {visibleCols.volume && (
                  <th className="px-4 py-2 cursor-pointer" onClick={() => changeSort('volume')}>
                    Volume {sortKey === 'volume' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((c) => (
                <tr key={c.id} className="border-t border-zinc-800">
                  <td className="px-4 py-2 text-zinc-400">{c.market_cap_rank}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <img src={c.image} alt={c.name} className="h-5 w-5 rounded-full" />
                    <Link to={`/moeda/${c.id}?vs=${vs}`} className="font-semibold text-white hover:underline">
                      {c.name}
                    </Link>
                    <span className="font-mono text-xs text-zinc-400">{c.symbol.toUpperCase()}</span>
                    <button
                      className={`ml-2 text-lg ${favorites.has(c.id) ? 'text-yellow-400' : 'text-zinc-600'} hover:text-yellow-300`}
                      onClick={() => toggleFavorite(c.id)}
                      aria-label={favorites.has(c.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      title={favorites.has(c.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      {favorites.has(c.id) ? '★' : '☆'}
                    </button>
                  </td>
                  {visibleCols.price && (
                    <td className="px-4 py-2">{nfCurrency.format(c.current_price)}</td>
                  )}
                  {visibleCols.market_cap && (
                    <td className="px-4 py-2">{nfCompact.format(c.market_cap)}</td>
                  )}
                  {visibleCols.change && (
                    <td className={`px-4 py-2 ${c.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {c.price_change_percentage_24h.toFixed(2)}%
                    </td>
                  )}
                  {visibleCols.volume && (
                    <td className="px-4 py-2">{nfCompact.format(c.total_volume ?? 0)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {!loading && !error && coins && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-zinc-400">Página {page}</div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}