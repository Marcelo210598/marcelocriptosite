export type MarketCoin = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  total_volume: number
}

export async function fetchMarkets(
  {
    vsCurrency = 'usd',
    perPage = 25,
    page = 1,
    order = 'market_cap_desc',
  }: { vsCurrency?: string; perPage?: number; page?: number; order?: string }
): Promise<MarketCoin[]> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets')
  url.searchParams.set('vs_currency', vsCurrency)
  url.searchParams.set('order', order || 'market_cap_desc')
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('page', String(page))
  url.searchParams.set('sparkline', 'false')
  url.searchParams.set('price_change_percentage', '24h')

  const res = await fetch(url.toString(), {
    headers: { 'accept': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`CoinGecko error ${res.status}`)
  }
  const data = (await res.json()) as MarketCoin[]
  return data
}

export type CoinDetail = {
  id: string
  symbol: string
  name: string
  image: string
  description?: string
  market_cap_rank?: number
  current_price: { usd?: number; brl?: number; eur?: number }
  market_cap: { usd?: number; brl?: number; eur?: number }
  total_volume: { usd?: number; brl?: number; eur?: number }
  price_change_percentage_24h?: number
  sparkline_7d?: number[]
}

export async function fetchCoinDetail(id: string): Promise<CoinDetail> {
  const url = new URL(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}`)
  url.searchParams.set('localization', 'false')
  url.searchParams.set('tickers', 'false')
  url.searchParams.set('market_data', 'true')
  url.searchParams.set('community_data', 'false')
  url.searchParams.set('developer_data', 'false')
  url.searchParams.set('sparkline', 'true')

  const res = await fetch(url.toString(), { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`CoinGecko error ${res.status}`)
  const json = await res.json()
  const detail: CoinDetail = {
    id: json.id,
    symbol: json.symbol,
    name: json.name,
    image: json.image?.large ?? json.image?.small ?? '',
    description: json.description?.en || json.description?.pt || undefined,
    market_cap_rank: json.market_cap_rank ?? json.market_data?.market_cap_rank,
    current_price: json.market_data?.current_price ?? {},
    market_cap: json.market_data?.market_cap ?? {},
    total_volume: json.market_data?.total_volume ?? {},
    price_change_percentage_24h: json.market_data?.price_change_percentage_24h,
    sparkline_7d: json.market_data?.sparkline_7d?.price ?? [],
  }
  return detail
}

export type MarketChart = {
  prices: [number, number][]
}

export async function fetchMarketChart({ id, vsCurrency = 'usd', days = 7 }: { id: string; vsCurrency?: string; days?: number }): Promise<MarketChart> {
  const tryFetch = async (targetDays: number): Promise<MarketChart> => {
    const url = new URL(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart`)
    url.searchParams.set('vs_currency', vsCurrency)
    url.searchParams.set('days', String(targetDays))
    const res = await fetch(url.toString(), { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`)
    const json = (await res.json()) as MarketChart
    return json
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  // Tentativas: 1) dias solicitado; 2) retry do mesmo período; 3) fallback para 30 dias
  try {
    return await tryFetch(days)
  } catch (e) {
    await sleep(500)
    try {
      return await tryFetch(days)
    } catch (e2) {
      await sleep(500)
      return await tryFetch(30)
    }
  }
}

export type SearchCoin = {
  id: string
  name: string
  symbol: string
  thumb?: string
}

// CoinGecko search endpoint for coin discovery by name/symbol
export async function fetchSearchCoins(query: string): Promise<SearchCoin[]> {
  if (!query || query.trim().length < 2) return []
  const url = new URL('https://api.coingecko.com/api/v3/search')
  url.searchParams.set('query', query.trim())
  const res = await fetch(url.toString(), { headers: { accept: 'application/json' } })
  if (!res.ok) return []
  const json = await res.json()
  const coins = Array.isArray(json?.coins) ? json.coins : []
  return coins.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name, symbol: c.symbol, thumb: c.thumb }))
}