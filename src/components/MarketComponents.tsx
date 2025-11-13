import React, { useState, useMemo } from 'react'
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import { PriceChangeBadge } from './UIComponents'
import { useFavorites } from '../hooks/useStore'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Buscar moedas...", 
  className = '' 
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
    </form>
  )
}

interface CoinCardProps {
  coin: {
    id: string
    name: string
    symbol: string
    image: string
    current_price: number
    market_cap: number
    price_change_percentage_24h: number
    market_cap_rank?: number
  }
  currency: string
  onClick: () => void
}

export const CoinCard: React.FC<CoinCardProps> = ({ coin, currency, onClick }) => {
  const nfCurrency = useMemo(() => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency.toUpperCase(),
      maximumFractionDigits: coin.current_price < 1 ? 6 : 2 
    }), [currency, coin.current_price])

  const nfCompact = useMemo(() => 
    new Intl.NumberFormat('en-US', { 
      notation: 'compact',
      maximumFractionDigits: 1 
    }), [])

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 p-4 hover:border-indigo-500 transition-all duration-200 hover:scale-105 hover-lift"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
          <div>
            <div className="font-medium group-hover:text-indigo-400 transition-colors">
              {coin.name}
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              {coin.symbol.toUpperCase()}
              {coin.market_cap_rank && (
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full">
                  #{coin.market_cap_rank}
                </span>
              )}
            </div>
          </div>
        </div>
        <FavoriteButton coinId={coin.id} coinName={coin.name} />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-lg font-semibold">
            {nfCurrency.format(coin.current_price)}
          </div>
          <div className="text-xs text-zinc-400">
            Cap: {nfCompact.format(coin.market_cap)}
          </div>
        </div>
        <PriceChangeBadge change={coin.price_change_percentage_24h} />
      </div>
    </div>
  )
}

interface FilterTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Array<{
    id: string
    label: string
    icon?: React.ReactNode
  }>
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === tab.id 
              ? 'bg-indigo-600 text-white' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}