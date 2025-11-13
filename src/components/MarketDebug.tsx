import React, { useEffect, useState } from 'react'
import { fetchMarkets, type MarketCoin } from '../services/coingecko'
import { InlineLoader } from './Loading'

export const MarketDebug: React.FC = () => {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchMarkets({ 
          vsCurrency: 'usd', 
          perPage: 10, 
          page: 1 
        })
        console.log('Market data received:', data.length, 'coins')
        setCoins(data)
      } catch (err: any) {
        console.error('Market error:', err)
        setError(err.message || 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <InlineLoader message="Carregando moedas..." />
  
  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Erro ao carregar mercado</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500/30"
        >
          Recarregar
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <h3 className="text-white font-semibold mb-3">Debug do Mercado</h3>
      <p className="text-zinc-400 text-sm mb-4">Carregou {coins.length} moedas</p>
      
      {coins.length > 0 && (
        <div className="space-y-2">
          {coins.slice(0, 3).map(coin => (
            <div key={coin.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded">
              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
              <div>
                <div className="text-white text-sm font-medium">{coin.name}</div>
                <div className="text-zinc-400 text-xs">{coin.symbol.toUpperCase()}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-white text-sm">${coin.current_price}</div>
                <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}