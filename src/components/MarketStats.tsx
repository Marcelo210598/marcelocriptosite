import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { fetchGlobalStatsWithRetry } from '../services/news-safe'

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
    const fetchStats = async () => {
      try {
        const result = await fetchGlobalStatsWithRetry()
        setStats({
          total_market_cap: result.data.total_market_cap.usd || 0,
          total_volume: result.data.total_volume.usd || 0,
          market_cap_change_percentage_24h_usd: result.data.market_cap_change_percentage_24h_usd || 0,
          active_cryptocurrencies: result.data.active_cryptocurrencies || 0
        })
        setIsMock(result.isMock)
        if (result.error) {
          console.warn('Aviso:', result.error)
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas globais:', error)
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-zinc-700 rounded mb-2"></div>
            <div className="h-6 bg-zinc-700 rounded"></div>
          </div>
        ))}
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
      icon: <DollarSign className="w-5 h-5 text-green-400" />,
      label: 'Capitalização',
      value: formatCurrency(stats.total_market_cap),
      change: stats.market_cap_change_percentage_24h_usd,
      color: 'green'
    },
    {
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      label: 'Volume 24h',
      value: formatCurrency(stats.total_volume),
      change: null,
      color: 'blue'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      label: 'Moedas Ativas',
      value: stats.active_cryptocurrencies.toLocaleString(),
      change: null,
      color: 'purple'
    },
    {
      icon: stats.market_cap_change_percentage_24h_usd >= 0 ? 
        <TrendingUp className="w-5 h-5 text-green-400" /> : 
        <TrendingDown className="w-5 h-5 text-red-400" />,
      label: 'Mudança 24h',
      value: `${stats.market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}${stats.market_cap_change_percentage_24h_usd.toFixed(2)}%`,
      change: stats.market_cap_change_percentage_24h_usd,
      color: stats.market_cap_change_percentage_24h_usd >= 0 ? 'green' : 'red'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsItems.map((item, index) => (
        <div 
          key={item.label}
          className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 hover-lift animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400">{item.label}</span>
            {item.icon}
          </div>
          <div className="text-lg font-semibold text-white">{item.value}</div>
          {item.change !== null && (
            <div className={`text-xs mt-1 ${
              item.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </div>
          )}
        </div>
      ))}
    </div>
  )
}