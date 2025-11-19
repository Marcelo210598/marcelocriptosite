import React, { useCallback, useMemo } from 'react'
import { fetchMarketsSafe, type MarketCoin } from '../services/coingecko-safe'
import { MobileMarketGrid } from '../components/MobileMarketComponents'
import { ListSkeleton } from '../components/SkeletonLoader'
import { useDataOptimization, useDebounce } from '../hooks/usePerformance'
import { useFavorites } from '../hooks/useStore'
import { AdvancedCoinFilters, useCoinFilters } from '../components/AdvancedCoinFilters'
import { CoinComparisonChart } from '../components/CoinComparisonChart'
import { PriceAlertsManager } from '../components/PriceAlertsManager'
import { AnimatedCard, AnimatedButton, AnimatedIcon } from '../components/AnimatedCard'
import { SmoothTransition } from '../components/PageTransition'
import { Filter, RefreshCw, BarChart3, Bell } from 'lucide-react'

const CATEGORIES = [
  'Smart Contract Platform',
  'DeFi',
  'Stablecoin',
  'Exchange Token',
  'Meme',
  'Gaming',
  'NFT',
  'Layer 1',
  'Layer 2',
  'Privacy'
]

export default function MarketSimple(): React.JSX.Element {
  const { favorites } = useFavorites()
  const { filters, setFilters, isFilterOpen, openFilters, closeFilters } = useCoinFilters()
  const [showComparison, setShowComparison] = React.useState(false)
  const [showAlerts, setShowAlerts] = React.useState(false)
  
  // Função memoizada para buscar dados
  const fetchCoins = useCallback(async () => {
    const result = await fetchMarketsSafe({ 
      vsCurrency: 'usd', 
      perPage: 50, // Buscar mais moedas para filtrar
      page: 1 
    })
    
    if (result.error) {
      console.warn('Aviso:', result.error)
    }
    
    return result.data
  }, [])

  // Usar hook de otimização com cache
  const { 
    data: coins, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isStale 
  } = useDataOptimization<MarketCoin[]>(fetchCoins, {
    cacheKey: 'market-coins',
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 3 * 60 * 1000, // Refetch a cada 3 minutos
    retryCount: 3,
    retryDelay: 1000
  })

  // Memoizar dados processados com filtros
  const processedCoins = useMemo(() => {
    if (!coins) return []
    
    let filteredCoins = coins.map(coin => ({
      ...coin,
      isFavorite: favorites.some(fav => fav === coin.id)
    }))

    // Aplicar filtros
    if (filters.showFavoritesOnly) {
      filteredCoins = filteredCoins.filter(coin => coin.isFavorite)
    }

    if (filters.showGainers) {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h > 0)
    }

    if (filters.showLosers) {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h < 0)
    }

    if (filters.showHighVolume) {
      filteredCoins = filteredCoins.filter(coin => coin.total_volume > 1000000)
    }

    // Filtros de preço
    filteredCoins = filteredCoins.filter(coin => 
      coin.current_price >= filters.priceRange[0] && 
      coin.current_price <= filters.priceRange[1]
    )

    // Filtros de capitalização
    filteredCoins = filteredCoins.filter(coin => 
      coin.market_cap >= filters.marketCapRange[0] && 
      coin.market_cap <= filters.marketCapRange[1]
    )

    // Filtros de volume
    filteredCoins = filteredCoins.filter(coin => 
      coin.total_volume >= filters.volumeRange[0] && 
      coin.total_volume <= filters.volumeRange[1]
    )

    // Filtros de mudança percentual
    filteredCoins = filteredCoins.filter(coin => 
      (coin.price_change_percentage_24h || 0) >= filters.changeRange[0] && 
      (coin.price_change_percentage_24h || 0) <= filters.changeRange[1]
    )

    // Ordenar
    filteredCoins.sort((a, b) => {
      let aValue, bValue
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.current_price
          bValue = b.current_price
          break
        case 'volume':
          aValue = a.total_volume
          bValue = b.total_volume
          break
        case 'change':
          aValue = a.price_change_percentage_24h || 0
          bValue = b.price_change_percentage_24h || 0
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'market_cap':
        default:
          aValue = a.market_cap
          bValue = b.market_cap
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filteredCoins
  }, [coins, favorites, filters])

  // Memoizar funções de callback
  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  if (isLoading && !isStale) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <AnimatedCard animationType="slideUp" duration={600}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mercado de Criptomoedas</h1>
              <p className="text-zinc-400">As principais criptomoedas em tempo real</p>
            </div>
            <AnimatedButton
              onClick={openFilters}
              variant="primary"
              size="md"
              animationType="scale"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </AnimatedButton>
          </div>
        </AnimatedCard>
        
        <ListSkeleton 
          items={8} 
          className="space-y-4"
        />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <AnimatedCard animationType="slideUp" duration={600}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mercado de Criptomoedas</h1>
              <p className="text-zinc-400">As principais criptomoedas em tempo real</p>
            </div>
            <AnimatedButton
              onClick={openFilters}
              variant="primary"
              size="md"
              animationType="scale"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </AnimatedButton>
          </div>
        </AnimatedCard>
        
        <AnimatedCard animationType="fadeIn" duration={500} className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Erro ao carregar mercado</h2>
          <p className="text-red-300 mb-4">{error?.message || 'Erro desconhecido'}</p>
          <AnimatedButton
            onClick={handleRetry}
            variant="danger"
            size="md"
            animationType="bounce"
          >
            Tentar novamente
          </AnimatedButton>
        </AnimatedCard>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <AnimatedCard animationType="slideUp" duration={600} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mercado de Criptomoedas</h1>
            <p className="text-zinc-400">
              {isStale && '🔄 Atualizando... '}
              As principais criptomoedas em tempo real
              {processedCoins.length > 0 && ` (${processedCoins.length} moedas)`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AnimatedButton
              onClick={() => {
                setShowAlerts(!showAlerts)
                setShowComparison(false)
              }}
              variant={showAlerts ? 'primary' : 'secondary'}
              size="md"
              animationType="scale"
              className={showAlerts ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <AnimatedIcon animationType="bounce" trigger="onHover">
                <Bell className="w-4 h-4 mr-2" />
              </AnimatedIcon>
              Alertas
            </AnimatedButton>
            <AnimatedButton
              onClick={() => {
                setShowComparison(!showComparison)
                setShowAlerts(false)
              }}
              variant={showComparison ? 'primary' : 'secondary'}
              size="md"
              animationType="scale"
              className={showComparison ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showComparison ? 'Lista' : 'Comparar'}
            </AnimatedButton>
            <AnimatedButton
              onClick={handleRetry}
              variant="secondary"
              size="md"
              animationType="scale"
              className="text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isStale ? 'animate-spin' : ''}`} />
              Atualizar
            </AnimatedButton>
            <AnimatedButton
              onClick={openFilters}
              variant="primary"
              size="md"
              animationType="scale"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>

      <SmoothTransition
        show={showAlerts}
        animationType="slideUp"
        duration={400}
      >
        <PriceAlertsManager />
      </SmoothTransition>

      <SmoothTransition
        show={showComparison}
        animationType="slideUp"
        duration={400}
      >
        <CoinComparisonChart />
      </SmoothTransition>

      {!showAlerts && !showComparison && (
        <SmoothTransition
          show={processedCoins.length > 0}
          animationType="fadeIn"
          duration={400}
        >
          {processedCoins.length > 0 ? (
            <AnimatedCard animationType="fadeIn" duration={500}>
              <MobileMarketGrid coins={processedCoins} />
            </AnimatedCard>
          ) : (
            <AnimatedCard animationType="fadeIn" duration={500} className="text-center text-zinc-400 py-12">
              <p>Nenhuma moeda corresponde aos filtros selecionados.</p>
              <AnimatedButton
                onClick={openFilters}
                variant="primary"
                size="md"
                animationType="bounce"
                className="mt-4"
              >
                Ajustar Filtros
              </AnimatedButton>
            </AnimatedCard>
          )}
        </SmoothTransition>
      )}

      {/* Componente de Filtros */}
      <AdvancedCoinFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={CATEGORIES}
        isOpen={isFilterOpen}
        onClose={closeFilters}
      />
    </section>
  )
}