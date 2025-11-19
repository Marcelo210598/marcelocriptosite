import React, { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

interface MarketStats {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h_usd: number
  active_cryptocurrencies: number
}

export const MarketStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    // Simplificando - não buscar dados do mercado
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 max-w-md w-full animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-zinc-700 rounded w-32"></div>
            <div className="w-5 h-5 bg-zinc-700 rounded"></div>
          </div>
          <div className="h-6 bg-zinc-700 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const statsItems = [
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
      label: 'Mercado de Criptomoedas',
      value: 'Dados em tempo real',
      change: null,
      color: 'indigo'
    }
  ]

  return (
    <div className="flex justify-center">
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 hover-lift animate-fade-in-up max-w-md w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-400">{statsItems[0].label}</span>
          {statsItems[0].icon}
        </div>
        <div className="text-xl font-semibold text-white">{statsItems[0].value}</div>
      </div>
    </div>
  )
}