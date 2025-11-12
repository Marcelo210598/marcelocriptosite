import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchNews, type NewsArticle } from '../services/news'

export default function Home(): React.JSX.Element {
  const [items, setItems] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Buscar notícias com foco em categorias populares
        const cats = ['Blockchain','Altcoin','Market','Trading','Regulation','Technology','DeFi','NFT']
        let data = await fetchNews({ lang: 'PT', categories: cats, pageSize: 24, maxAgeDays: 7 })
        // Fallback para EN se vier pouco conteúdo
        if (data.length < 5) {
          const en = await fetchNews({ lang: 'EN', categories: cats, pageSize: 24, maxAgeDays: 7 })
          data = [...data, ...en]
        }
        // Filtrar itens com imagem para melhor visual do carrossel e ordenar por data
        const withImages = data.filter((d) => !!d.imageUrl)
        const sorted = withImages.sort((a, b) => b.publishedAt - a.publishedAt)
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
    return () => { cancelled = true }
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
  const openArticle = (a: NewsArticle) => navigate(`/noticia/${encodeURIComponent(a.id)}`, { state: a })

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Noticias e Analises</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">
        Acompanhe novidades, entenda conceitos e aprofunde-se em análises fundamentais do mercado
        de criptomoedas.
      </p>
      <div className="mt-5 flex gap-3">
        <Link to="/analises" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">Ir para Análises</Link>
        <Link to="/noticias" className="rounded border border-indigo-500/50 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/10">Ver Notícias</Link>
      </div>

      {/* Carrossel de notícias mais comentadas */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Em destaque</h2>
        </div>

        {/* Estados */}
        {loading && (
          <div className="mt-4 h-52 rounded-lg border border-zinc-700 bg-zinc-900/40 animate-pulse" />
        )}
        {error && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}

        {!loading && !error && current && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-zinc-700">
            {/* Imagem de fundo */}
            {current.imageUrl ? (
              <img
                src={toProxy(current.imageUrl)}
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
              <div className="text-[11px] text-zinc-300">{current.source} • {new Date(current.publishedAt * 1000).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
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
    </section>
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