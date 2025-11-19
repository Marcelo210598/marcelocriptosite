import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchNewsWithRetry, type NewsItem } from '../services/news-safe'
import { fetchMarketsSafe, type MarketCoin } from '../services/coingecko-safe'
import { Helmet } from 'react-helmet-async'
import { MarketSkeleton, NewsCarouselSkeleton, CoinListSkeleton } from '../components/SkeletonLoader'
import { FavoriteButton } from '../components/FavoriteButton'
import { PriceChangeBadge } from '../components/UIComponents'
import { useFavorites } from '../hooks/useStore'
import { MarketStatsWidget } from '../components/MarketStats'
import { MarketDebug } from '../components/MarketDebug'
import { PageTitle, SectionTitle, BodyText } from '../components/ResponsiveText'

export default function Home(): React.JSX.Element {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()

  const [vs, setVs] = useState<'usd' | 'brl' | 'eur'>('usd')
  const [marketCoins, setMarketCoins] = useState<MarketCoin[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)
  const didInitNews = useRef(false)
  const didInitMarkets = useRef(false)
  const { favorites } = useFavorites()

  useEffect(() => {
    // Evita execução duplicada em dev (React.StrictMode)
    if (import.meta.env?.DEV && !didInitNews.current) {
      didInitNews.current = true
      return
    }
    const ctrl = new AbortController()
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Buscar notícias com foco em categorias populares
        const cats = ['Blockchain','Altcoin','Market','Trading','Regulation','Technology','DeFi','NFT']
        const result = await fetchNewsWithRetry(cats)
        
        if (result.error) {
          console.warn('Aviso:', result.error)
        }
        
        // Filtrar itens com imagem para melhor visual do carrossel e ordenar por data
        const withImages = result.data.filter((d) => !!d.imageurl)
        const sorted = withImages.sort((a, b) => b.published_on - a.published_on)
        if (!cancelled) {
          setItems(sorted.slice(0, 10))
          setIdx(0)
        }
      } catch (e: any) {
        // Ignorar erros de aborto de requisição (cleanup/StrictMode)
        if (e?.name === 'AbortError' || /aborted/i.test(String(e?.message))) {
          // silencioso
        } else if (!cancelled) {
          setError('Não foi possível carregar notícias agora. Tente novamente mais tarde.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true; ctrl.abort() }
  }, [])

  // Auto-avançar o carrossel
  useEffect(() => {
    if (items.length === 0) return
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000)
    return () => clearInterval(t)
  }, [items.length])

  const current = useMemo(() => items[idx] || null, [items, idx])
  const goPrev = () => setIdx((i) => (i - 1 + items.length) % items.length)
  const goNext = () => setIdx((i) => (i + 1) % items.length)
  const openArticle = (a: NewsItem) => navigate(`/noticia/${encodeURIComponent(a.id)}`, { state: a })
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://marcelocriptosite.vercel.app'
  const siteUrl = `${siteOrigin}/`
  const brandOgUrl = `${siteOrigin}/brand-og.png`
  const brandLogoUrl = `${siteOrigin}/brand-logo.png`

  useEffect(() => {
    // Evita execução duplicada em dev (React.StrictMode)
    if (import.meta.env?.DEV && !didInitMarkets.current) {
      didInitMarkets.current = true
      return
    }
    const ctrl = new AbortController()
    let cancelled = false
    const loadMarkets = async () => {
      setMarketLoading(true)
      setMarketError(null)
      try {
        const result = await fetchMarketsSafe({ vsCurrency: vs, perPage: 100, page: 1, order: 'market_cap_desc', signal: ctrl.signal })
        if (!cancelled) {
          setMarketCoins(result.data)
          if (result.error) {
            console.warn('Aviso:', result.error)
          }
        }
      } catch (e: any) {
        if (e?.name === 'AbortError' || /aborted/i.test(String(e?.message))) {
          // ignorar abortos de Strict Mode/dev
        } else if (!cancelled) {
          setMarketError('Não foi possível carregar o mercado agora.')
        }
      } finally {
        if (!cancelled) setMarketLoading(false)
      }
    }
    loadMarkets()
    return () => { cancelled = true; ctrl.abort() }
  }, [vs])

  const nfCurrency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: vs.toUpperCase(), maximumFractionDigits: 0 }), [vs])
  const nfCompact = useMemo(() => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }), [])

  const totalMarketCap = useMemo(() => marketCoins.reduce((sum, c) => sum + (c.market_cap || 0), 0), [marketCoins])
  const totalVolume24h = useMemo(() => marketCoins.reduce((sum, c) => sum + (c.total_volume || 0), 0), [marketCoins])
  const btcMc = useMemo(() => (marketCoins.find((c) => c.id === 'bitcoin')?.market_cap || 0), [marketCoins])
  const ethMc = useMemo(() => (marketCoins.find((c) => c.id === 'ethereum')?.market_cap || 0), [marketCoins])
  const btcDom = useMemo(() => (totalMarketCap > 0 ? (btcMc / totalMarketCap) * 100 : 0), [btcMc, totalMarketCap])
  const ethDom = useMemo(() => (totalMarketCap > 0 ? (ethMc / totalMarketCap) * 100 : 0), [ethMc, totalMarketCap])

  const movers = useMemo(() => marketCoins.filter((c) => Number.isFinite(c.price_change_percentage_24h)), [marketCoins])
  const topGainers = useMemo(() => [...movers].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5), [movers])
  const topLosers = useMemo(() => [...movers].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5), [movers])
  
  // Favoritos do usuário
  const favoriteCoins = useMemo(() => 
    marketCoins.filter(coin => favorites.includes(coin.id)).slice(0, 5), 
    [marketCoins, favorites]
  )

  return (
    <>
      <Helmet>
        <title>Marcelo Cripto — Notícias e Mercado de Cripto</title>
        <meta name="description" content="Acompanhe notícias recentes de criptomoedas, análises e mercado." />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content="Marcelo Cripto — Notícias e Mercado de Cripto" />
        <meta property="og:description" content="Acompanhe notícias recentes de criptomoedas, análises e mercado." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={brandOgUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Marcelo Cripto — Notícias e Mercado de Cripto" />
        <meta name="twitter:description" content="Acompanhe notícias recentes de criptomoedas, análises e mercado." />
        <meta name="twitter:image" content={brandOgUrl} />
        <meta name="twitter:image:alt" content="Banner institucional Marcelo Cripto" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Marcelo Cripto",
            url: siteUrl,
            logo: {
              "@type": "ImageObject",
              url: brandLogoUrl
            }
          })}
        </script>
      </Helmet>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <PageTitle className="animate-fade-in-up">Noticias e Analises</PageTitle>
        <BodyText className="animate-fade-in-up max-w-2xl" muted>
          Acompanhe novidades, entenda conceitos e aprofunde-se em análises fundamentais do mercado
          de criptomoedas.
        </BodyText>
      <div className="mt-5 flex gap-3 animate-fade-in-up">
        <Link to="/analises" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-all-300 hover-lift">Ir para Análises</Link>
        <Link to="/noticias" className="rounded border border-indigo-500/50 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/10 transition-all-300">Ver Notícias</Link>
      </div>

      <div className="mt-8">
        <MarketStatsWidget />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <SectionTitle>Visão do Mercado</SectionTitle>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Moeda:</label>
            <select value={vs} onChange={(e) => setVs(e.target.value as typeof vs)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-white">
              <option value="usd">USD</option>
              <option value="brl">BRL</option>
              <option value="eur">EUR</option>
            </select>
            <Link to={`/market?vs=${vs}`} className="text-xs text-indigo-300 hover:text-indigo-200">Ver mercado completo →</Link>
          </div>
        </div>
        {marketLoading && <MarketSkeleton />}
        {marketError && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{marketError}</div>
        )}
        {!marketLoading && !marketError && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-400">Capitalização</div>
              <div className="mt-1 text-lg font-semibold">{nfCurrency.format(totalMarketCap)}</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-400">Volume 24h</div>
              <div className="mt-1 text-lg font-semibold">{nfCurrency.format(totalVolume24h)}</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-400">BTC Dominance</div>
              <div className="mt-1 text-lg font-semibold">{btcDom.toFixed(1)}%</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-400">ETH Dominance</div>
              <div className="mt-1 text-lg font-semibold">{ethDom.toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <SectionTitle>Destaques e Maiores Movimentações (24h)</SectionTitle>
        </div>
        {marketLoading && (
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <CoinListSkeleton />
            <CoinListSkeleton />
          </div>
        )}
        {(!marketLoading && !marketError) && (
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm text-zinc-400">Em alta</div>
              <ul className="mt-2 divide-y divide-zinc-800 rounded-lg border border-zinc-700 bg-zinc-900">
                {topGainers.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors group">
                    <img src={c.image} alt={c.name} className="h-6 w-6 rounded-full" />
                    <Link to={`/moeda/${encodeURIComponent(c.id)}`} className="flex-1 text-sm font-medium hover:underline">
                      {c.name} 
                      <span className="ml-1 text-xs text-zinc-400">{c.symbol.toUpperCase()}</span>
                    </Link>
                    <FavoriteButton coinId={c.id} coinName={c.name} size="sm" />
                    <PriceChangeBadge change={c.price_change_percentage_24h} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Em queda</div>
              <ul className="mt-2 divide-y divide-zinc-800 rounded-lg border border-zinc-700 bg-zinc-900">
                {topLosers.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors group">
                    <img src={c.image} alt={c.name} className="h-6 w-6 rounded-full" />
                    <Link to={`/moeda/${encodeURIComponent(c.id)}`} className="flex-1 text-sm font-medium hover:underline">
                      {c.name} 
                      <span className="ml-1 text-xs text-zinc-400">{c.symbol.toUpperCase()}</span>
                    </Link>
                    <FavoriteButton coinId={c.id} coinName={c.name} size="sm" />
                    <PriceChangeBadge change={c.price_change_percentage_24h} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Carrossel de notícias mais comentadas */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <SectionTitle>Em destaque</SectionTitle>
        </div>

        {/* Estados */}
        {loading && <NewsCarouselSkeleton />}
        {error && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}

        {!loading && !error && current && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-zinc-700">
            {/* Imagem de fundo */}
            {current.imageurl ? (
              <img
                src={toProxy(current.imageurl)}
                alt={current.title}
                className="h-52 w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.src = fallbackImg
                }}
              />
            ) : (
              <div className="h-52 w-full bg-zinc-800" />
            )}
            {/* Overlay de texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-[11px] text-zinc-300">{current.source} • {new Date(current.published_on * 1000).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              <button onClick={() => openArticle(current)} className="mt-1 text-sm font-semibold text-white hover:underline text-left">
                {current.title}
              </button>
            </div>

            {/* Controles */}
            <button onClick={goPrev} aria-label="Anterior" className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60">←</button>
            <button onClick={goNext} aria-label="Próximo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60">→</button>

            {/* Indicadores */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`h-1.5 w-4 rounded ${i === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} aria-label={`Ir para item ${i + 1}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Manchetes</h3>
          <Link to="/noticias" className="text-xs text-indigo-300 hover:text-indigo-200">Ver todas →</Link>
        </div>
        {!loading && !error && items.length > 0 && (
          <div className="mt-2 overflow-x-auto whitespace-nowrap rounded-lg border border-zinc-700 bg-zinc-900 py-2">
            {items.map((n) => (
              <button key={n.id} onClick={() => openArticle(n)} className="inline-flex items-center gap-2 rounded px-3 py-1 text-left hover:bg-zinc-800">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span className="text-xs text-zinc-200">{n.title}</span>
                <span className="text-[10px] text-zinc-500">• {n.source}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Seção de Favoritos */}
      {favoriteCoins.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <SectionTitle className="flex items-center gap-2">
              <span className="text-yellow-400">⭐</span> Suas Criptomoedas Favoritas
            </SectionTitle>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {favoriteCoins.map((coin) => (
              <Link
                key={coin.id}
                to={`/moeda/${encodeURIComponent(coin.id)}`}
                className="group rounded-lg border border-zinc-700 bg-zinc-900 p-4 hover:border-indigo-500 transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <div className="font-medium group-hover:text-indigo-400 transition-colors">{coin.name}</div>
                      <div className="text-xs text-zinc-400">{coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{nfCurrency.format(coin.current_price)}</div>
                    <PriceChangeBadge change={coin.price_change_percentage_24h} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Debug do Mercado - Remover depois de testar */}
      <div className="mt-10">
        <SectionTitle>Debug do Mercado</SectionTitle>
        <MarketDebug />
      </div>

      </section>
    </>
  )
}

// Proxy simples para evitar bloqueio/mixed content e melhorar compatibilidade
const toProxy = (url?: string): string => {
  if (!url) return ''
  const normalized = url.replace(/^http:\/\//i, 'https://')
  return `https://images.weserv.nl/?url=${encodeURIComponent(normalized)}&w=1200&h=300&fit=cover&output=webp`
}

const fallbackImg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><rect width="100%" height="100%" fill="#1f2937"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="24">Imagem indisponível</text></svg>'
  )