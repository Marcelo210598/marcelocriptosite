import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap } from 'lucide-react'
import { fetchMarketsSafe, type MarketCoin } from '../services/coingecko-safe'
import { useFavorites } from '../hooks/useStore'
import { ResponsiveText, CardTitle, BodyText } from './ResponsiveText'
import { LazyImage } from './OptimizedImage'
import { AnimatedChart, AnimatedChartCard } from './AnimatedChart'
import { AnimatedCard, AnimatedIcon } from './AnimatedCard'
import { useScrollAnimation } from '../hooks/useAnimation'

interface ChartData {
  time: string
  price: number
  volume: number
}

interface DashboardStats {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  activeCoins: number
}

export const MobileDashboard: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<string>('bitcoin')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { favorites } = useFavorites()
  const [favoriteCoins, setFavoriteCoins] = useState<MarketCoin[]>([])

  // Dados mock para demonstração (em produção, buscar de API real)
  const generateMockData = () => {
    const data: ChartData[] = []
    const now = Date.now()
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000)
      const basePrice = 45000 + Math.random() * 5000
      const price = basePrice + Math.sin(i * 0.5) * 2000 + (Math.random() - 0.5) * 1000
      const volume = 20000000000 + Math.random() * 10000000000
      
      data.push({
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        price: Math.round(price),
        volume: Math.round(volume)
      })
    }
    
    return data
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Simular carregamento de dados
      setTimeout(() => {
        setChartData(generateMockData())
        setStats({
          totalMarketCap: 1.2e12,
          totalVolume: 45e9,
          btcDominance: 42.5,
          activeCoins: 8500
        })
        setLoading(false)
      }, 1000)
    }

    loadData()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadFavoriteCoins = async () => {
      if (favorites.length === 0) {
        setFavoriteCoins([])
        return
      }

      try {
        // Buscar dados das moedas favoritas
        const result = await fetchMarketsSafe({ page: 1, perPage: 10 })
        const coinsData = result.data.filter(coin => favorites.includes(coin.id))
        setFavoriteCoins(coinsData)
      } catch (error) {
        console.error('Erro ao buscar moedas favoritas:', error)
        // Em caso de erro, criar dados mock baseados nos IDs
        const mockCoins = favorites.map(id => ({
          id,
          symbol: id.substring(0, 3).toUpperCase(),
          name: id.charAt(0).toUpperCase() + id.slice(1),
          image: `https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=${id.substring(0, 2).toUpperCase()}`,
          current_price: Math.random() * 50000 + 1000,
          market_cap: Math.random() * 1000000000000,
          market_cap_rank: Math.floor(Math.random() * 100) + 1,
          price_change_percentage_24h: (Math.random() - 0.5) * 20
        }))
        setFavoriteCoins(mockCoins as MarketCoin[])
      }
    }

    loadFavoriteCoins()
  }, [favorites])

  const StatCard: React.FC<{
    title: string
    value: string
    change: number
    icon: React.ElementType
    loading?: boolean
  }> = ({ title, value, change, icon: Icon, loading }) => (
    <AnimatedCard
      animationType="scale"
      duration={400}
      className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-4 border border-zinc-700"
    >
      <div className="flex items-center justify-between mb-2">
        <AnimatedIcon animationType="pulse" trigger="onMount" duration={2000}>
          <Icon className="w-5 h-5 text-indigo-400" />
        </AnimatedIcon>
        {loading ? (
          <div className="w-12 h-4 bg-zinc-700 rounded animate-pulse" />
        ) : (
          <div className={`text-sm font-medium ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <CardTitle>{title}</CardTitle>
      <BodyText muted small>{value}</BodyText>
    </AnimatedCard>
  )

  const ChartCard: React.FC<{
    title: string
    data: ChartData[]
    dataKey: 'price' | 'volume'
    color: string
    loading?: boolean
  }> = ({ title, data, dataKey, color, loading }) => (
    <AnimatedChartCard 
      title={title}
      animationType="slideUp"
      duration={600}
    >
      {loading ? (
        <div className="h-48 bg-zinc-800 rounded-lg animate-pulse" />
      ) : (
        <AnimatedChart
          data={data}
          type="area"
          height={192}
          colors={[color]}
          dataKey={dataKey}
          xAxisKey="time"
          title=""
          showGrid={true}
          showTooltip={true}
          animationDuration={1200}
        />
      )}
    </AnimatedChartCard>
  )

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <AnimatedCard
              key={i}
              animationType="fadeIn"
              duration={400}
              delay={i * 100}
              className="bg-zinc-900 rounded-xl p-4 border border-zinc-700"
              hover={false}
            >
              <div className="w-5 h-5 bg-zinc-700 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-zinc-700 rounded mb-1 animate-pulse" />
              <div className="h-3 bg-zinc-700 rounded animate-pulse" />
            </AnimatedCard>
          ))}
        </div>
        <AnimatedCard
          animationType="slideUp"
          duration={500}
          className="bg-zinc-900 rounded-xl p-4 border border-zinc-700"
          hover={false}
        >
          <div className="h-4 bg-zinc-700 rounded mb-4 animate-pulse" />
          <div className="h-48 bg-zinc-800 rounded-lg animate-pulse" />
        </AnimatedCard>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Capitalização de Mercado"
          value={`$${(stats?.totalMarketCap! / 1e12).toFixed(2)}T`}
          change={2.5}
          icon={DollarSign}
        />
        <StatCard
          title="Volume 24h"
          value={`$${(stats?.totalVolume! / 1e9).toFixed(1)}B`}
          change={-1.2}
          icon={Activity}
        />
        <StatCard
          title="BTC Dominância"
          value={`${stats?.btcDominance}%`}
          change={0.8}
          icon={TrendingUp}
        />
        <StatCard
          title="Moedas Ativas"
          value={`${stats?.activeCoins}`}
          change={5.2}
          icon={Users}
        />
      </div>

      {/* Gráfico de preço */}
      <ChartCard
        title="Preço do Bitcoin (24h)"
        data={chartData}
        dataKey="price"
        color="#3B82F6"
      />

      {/* Gráfico de volume */}
      <ChartCard
        title="Volume de Negociação (24h)"
        data={chartData}
        dataKey="volume"
        color="#10B981"
      />

      {/* Favoritos rápidos */}
      {favorites.length > 0 && (
        <AnimatedCard
          animationType="slideUp"
          duration={500}
          className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-4 border border-zinc-700"
        >
          <AnimatedIcon animationType="bounce" trigger="onMount" duration={1000}>
            <CardTitle className="mb-3">⭐ Favoritos</CardTitle>
          </AnimatedIcon>
          <div className="space-y-2">
            {favoriteCoins.slice(0, 3).map((coin, index) => (
              <AnimatedCard
                key={coin.id}
                animationType="fadeIn"
                duration={300}
                delay={index * 100}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50"
                hover={false}
              >
                <div className="flex items-center gap-2">
                  <LazyImage
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                    width={24}
                    height={24}
                  />
                  <div>
                    <BodyText small>{coin.name}</BodyText>
                    <BodyText muted small>{coin.symbol.toUpperCase()}</BodyText>
                  </div>
                </div>
                <div className="text-right">
                  <BodyText small>${coin.current_price.toLocaleString()}</BodyText>
                  <div className={`text-xs ${
                    (coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                    {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}