import React, { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TrendingUp, TrendingDown, Star } from 'lucide-react'
import { fetchMarketsSafe, type MarketCoin } from '../services/coingecko-safe'
import { SearchBar, CoinCard, FilterTabs } from '../components/MarketComponents'
import { useSearch } from '../hooks/useUtils'
import { useFavorites } from '../hooks/useStore'

export default function Market(): React.JSX.Element {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [vs, setVs] = useState<'usd' | 'brl' | 'eur'>('usd')
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'change'>('market_cap')
  const { favorites } = useFavorites()
  
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(
    coins,
    (coin) => `${coin.name} ${coin.symbol}`
  )

  useEffect(() => {
    const vsParam = searchParams.get('vs')?.toLowerCase()
    if (vsParam && ['usd', 'brl', 'eur'].includes(vsParam)) {
      setVs(vsParam as typeof vs)
    }
    
    const qParam = searchParams.get('q')
    if (qParam) {
      setSearchQuery(qParam)
    }
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    if (vs !== 'usd') {
      params.set('vs', vs)
    } else {
      params.delete('vs')
    }
    setSearchParams(params)
  }, [searchQuery, vs, searchParams, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    
    const loadMarkets = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchMarketsSafe({ 
          vsCurrency: vs, 
          perPage: 250, 
          page: 1, 
          order: 'market_cap_desc',
          signal: controller.signal 
        })
        setCoins(result.data)
        setIsMockData(result.isMock)
        
        if (result.error) {
          console.warn('Aviso:', result.error)
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError('Não foi possível carregar o mercado agora.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadMarkets()
    return () => controller.abort()
  }, [vs])

  const sortedCoins = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.current_price - a.current_price
        case 'change':
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        case 'market_cap':
        default:
          return (b.market_cap || 0) - (a.market_cap || 0)
      }
    })
    return sorted
  }, [filteredItems, sortBy])

  const favoriteCoins = useMemo(() => 
    coins.filter(coin => favorites.includes(coin.id)),
    [coins, favorites]
  )

  const tabs = [
    { id: 'all', label: 'Todas' },
    { id: 'gainers', label: 'Em Alta', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'losers', label: 'Em Baixa', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favoritas', icon: <Star className="w-4 h-4" /> },
  ]

  const [activeTab, setActiveTab] = useState('all')

  const displayCoins = useMemo(() => {
    switch (activeTab) {
      case 'gainers':
        return sortedCoins.filter(coin => (coin.price_change_percentage_24h || 0) > 0)
      case 'losers':
        return sortedCoins.filter(coin => (coin.price_change_percentage_24h || 0) < 0)
      case 'favorites':
        return favoriteCoins.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
      case 'all':
      default:
        return sortedCoins
    }
  }, [sortedCoins, favoriteCoins, activeTab])

  const sortOptions = [
    { id: 'market_cap', label: 'Capitalização' },
    { id: 'price', label: 'Preço' },
    { id: 'change', label: 'Mudança 24h' },
  ]

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-zinc-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-zinc-800 rounded-lg p-4 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Erro ao carregar mercado</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 animate-fade-in-up">Mercado de Criptomoedas</h1>
        
        {isMockData && (
          <div className="p-4 mb-6 bg-yellow-900 border border-yellow-700 text-yellow-200 rounded">
            ⚠️ Você está visualizando dados de demonstração. A API de mercado está temporariamente indisponível.
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Buscar moedas por nome ou símbolo..."
            className="flex-1"
          />
          
          <select
            value={vs}
            onChange={(e) => setVs(e.target.value as typeof vs)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="usd">USD</option>
            <option value="brl">BRL</option>
            <option value="eur">EUR</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <FilterTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />
      </div>

      {displayCoins.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-zinc-400 text-lg mb-2">Nenhuma moeda encontrada</div>
          <div className="text-zinc-500 text-sm">
            {searchQuery ? `Tente ajustar sua busca para "${searchQuery}"` : 'Tente mudar os filtros'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayCoins.map((coin, index) => (
            <div 
              key={coin.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CoinCard
                coin={coin}
                currency={vs}
                onClick={() => window.location.href = `/moeda/${encodeURIComponent(coin.id)}`}
              />
            </div>
          ))}
        </div>
      )}
      
      {displayCoins.length > 0 && (
        <div className="mt-8 text-center text-zinc-400 text-sm">
          Mostrando {displayCoins.length} de {sortedCoins.length} moedas
          {searchQuery && ` (filtrado de ${coins.length} total)`}
        </div>
      )}
    </div>
  )
}