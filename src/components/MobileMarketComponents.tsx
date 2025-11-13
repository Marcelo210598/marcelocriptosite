import React from 'react'
import { TrendingUp, TrendingDown, Star, Heart } from 'lucide-react'
import { MarketCoin } from '../services/coingecko'
import { useFavorites } from '../hooks/useStore'
import { showNotification } from '../utils/notifications'
import { LazyImage } from './OptimizedImage'

interface MobileCoinCardProps {
  coin: MarketCoin
  onFavorite?: (coin: MarketCoin) => void
  isFavorite?: boolean
}

export const MobileCoinCard: React.FC<MobileCoinCardProps> = ({ 
  coin, 
  onFavorite, 
  isFavorite = false 
}) => {
  const { addFavorite, removeFavorite } = useFavorites()
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isFavorite) {
      removeFavorite(coin.id)
      showNotification(`${coin.name} removido dos favoritos`, 'info')
    } else {
      addFavorite(coin)
      showNotification(`${coin.name} adicionado aos favoritos`, 'success')
    }
    
    onFavorite?.(coin)
  }

  const priceChange = coin.price_change_percentage_24h || 0
  const isPositive = priceChange >= 0

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]">
      {/* Header com imagem e informações principais */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <LazyImage 
            src={coin.image} 
            alt={coin.name} 
            className="w-12 h-12 rounded-full shadow-lg"
            width={48}
            height={48}
          />
          <div className="min-w-0">
            <h3 className="text-white font-bold text-lg truncate">{coin.name}</h3>
            <p className="text-zinc-400 text-sm uppercase tracking-wide">{coin.symbol}</p>
          </div>
        </div>
        
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full transition-colors duration-200 hover:bg-zinc-700/50 active:bg-zinc-700/70"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-zinc-500 hover:text-red-400'
            }`} 
          />
        </button>
      </div>

      {/* Preço e variação */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Preço</span>
          <span className="text-white font-bold text-xl">
            ${coin.current_price.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">24h</span>
          <div className={`flex items-center gap-1 font-semibold ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm">
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Volume e Market Cap */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-700/50">
          <div>
            <p className="text-zinc-400 text-xs">Volume 24h</p>
            <p className="text-white font-medium text-sm">
              ${(coin.total_volume / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs">Market Cap</p>
            <p className="text-white font-medium text-sm">
              ${(coin.market_cap / 1000000000).toFixed(1)}B
            </p>
          </div>
        </div>
      </div>

      {/* Botão de ação */}
      <button className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all duration-200 active:scale-[0.98]">
        Ver Detalhes
      </button>
    </div>
  )
}

interface MobileMarketGridProps {
  coins: MarketCoin[]
  loading?: boolean
  onFavoriteToggle?: (coin: MarketCoin) => void
}

export const MobileMarketGrid: React.FC<MobileMarketGridProps> = ({ 
  coins, 
  loading = false,
  onFavoriteToggle 
}) => {
  const { favorites } = useFavorites()
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-700 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-700 rounded-full" />
                <div>
                  <div className="w-24 h-6 bg-zinc-700 rounded mb-2" />
                  <div className="w-16 h-4 bg-zinc-700 rounded" />
                </div>
              </div>
              <div className="w-8 h-8 bg-zinc-700 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-zinc-700 rounded" />
              <div className="h-4 bg-zinc-700 rounded" />
              <div className="h-8 bg-zinc-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (coins.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">Nenhuma moeda encontrada</h3>
        <p className="text-zinc-500">Tente ajustar sua busca ou filtros</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {coins.map((coin) => (
        <MobileCoinCard 
          key={coin.id}
          coin={coin}
          isFavorite={favorites.some(fav => fav.id === coin.id)}
          onFavorite={onFavoriteToggle}
        />
      ))}
    </div>
  )
}