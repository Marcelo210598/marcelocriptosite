import React, { useEffect, useState } from 'react'
import { fetchMarkets, type MarketCoin } from '../services/coingecko'
import { InlineLoader } from '../components/Loading'

export default function Market(): React.JSX.Element {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Iniciando carregamento do mercado...')
        const data = await fetchMarkets({ 
          vsCurrency: 'usd', 
          perPage: 20, 
          page: 1 
        })
        console.log('Dados recebidos:', data.length, 'moedas')
        console.log('Primeira moeda:', data[0])
        setCoins(data)
      } catch (err: any) {
        console.error('Erro completo:', err)
        setError(err.message || 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <InlineLoader message="Carregando moedas..." />
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
      <h1 className="text-3xl font-bold mb-6">Mercado de Criptomoedas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coins.map((coin) => (
          <div key={coin.id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 hover:border-indigo-500 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
              <div>
                <h3 className="text-white font-medium">{coin.name}</h3>
                <p className="text-zinc-400 text-sm">{coin.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-white font-mono">
              ${coin.current_price.toLocaleString()}
            </div>
            <div className={`text-sm mt-1 ${
              coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}
              {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}