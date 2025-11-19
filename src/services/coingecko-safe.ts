import type { MarketCoin, CoinDetail, MarketChart, SearchCoin } from './coingecko'
import { mockMarketCoins, mockCoinDetail, mockMarketChart, mockSearchCoins } from './coingecko-mock'

// Exportar tipos para uso externo
export type { MarketCoin, CoinDetail, MarketChart, SearchCoin }

// Configuração de retry e timeout
const MAX_RETRIES = 2
const TIMEOUT_MS = 8000

// Função auxiliar para fetch com timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Função auxiliar para retry com backoff exponencial
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = 1000
): Promise<T> {
  try {
    return await fetchFn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(fetchFn, retries - 1, delay * 2)
    }
    throw error
  }
}

// Wrapper melhorado para fetchMarkets
export async function fetchMarketsSafe(
  {
    vsCurrency = 'usd',
    perPage = 25,
    page = 1,
    order = 'market_cap_desc',
    signal,
  }: { vsCurrency?: string; perPage?: number; page?: number; order?: string; signal?: AbortSignal }
): Promise<{ data: MarketCoin[]; isMock: boolean; error?: string }> {
  
  // Primeiro tentar com dados reais
  try {
    const { fetchMarkets } = await import('./coingecko')
    const data = await fetchWithRetry(() => fetchMarkets({ vsCurrency, perPage, page, order, signal }))
    return { data, isMock: false }
  } catch (error) {
    console.warn('API CoinGecko falhou, usando dados mock:', error)
    
    // Se falhar, retornar dados mock
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const mockData = mockMarketCoins.slice(startIndex, endIndex)
    
    return { 
      data: mockData, 
      isMock: true, 
      error: 'Dados de demonstração - API indisponível' 
    }
  }
}

// Wrapper melhorado para fetchCoinDetail
export async function fetchCoinDetailSafe(id: string): Promise<{ data: CoinDetail; isMock: boolean; error?: string }> {
  try {
    const { fetchCoinDetail } = await import('./coingecko')
    const data = await fetchWithRetry(() => fetchCoinDetail(id))
    return { data, isMock: false }
  } catch (error) {
    console.warn('API CoinGecko falhou, usando dados mock:', error)
    
    // Retornar dados mock adaptados
    const mockData = {
      ...mockCoinDetail,
      id,
      symbol: id.substring(0, 3).toLowerCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1)
    }
    
    return { 
      data: mockData, 
      isMock: true, 
      error: 'Dados de demonstração - API indisponível' 
    }
  }
}

// Wrapper melhorado para fetchMarketChart
export async function fetchMarketChartSafe({ 
  id, 
  vsCurrency = 'usd', 
  days = 7 
}: { 
  id: string; 
  vsCurrency?: string; 
  days?: number 
}): Promise<{ data: MarketChart; isMock: boolean; error?: string }> {
  try {
    const { fetchMarketChart } = await import('./coingecko')
    const data = await fetchWithRetry(() => fetchMarketChart({ id, vsCurrency, days }))
    return { data, isMock: false }
  } catch (error) {
    console.warn('API CoinGecko falhou, usando dados mock:', error)
    
    // Retornar dados mock adaptados
    const mockData: MarketChart = {
      ...mockMarketChart,
      prices: Array.from({ length: days * 24 }, (_, i): [number, number] => [
        Date.now() - (days * 24 - 1 - i) * 3600000,
        42000 + Math.sin(i * 0.1) * 2000 + (Math.random() - 0.5) * 1000
      ])
    }
    
    return { 
      data: mockData, 
      isMock: true, 
      error: 'Dados de demonstração - API indisponível' 
    }
  }
}

// Wrapper melhorado para fetchSearchCoins
export async function fetchSearchCoinsSafe(query: string): Promise<{ data: SearchCoin[]; isMock: boolean; error?: string }> {
  if (!query || query.trim().length < 2) {
    return { data: [], isMock: false }
  }
  
  try {
    const { fetchSearchCoins } = await import('./coingecko')
    const data = await fetchWithRetry(() => fetchSearchCoins(query))
    return { data, isMock: false }
  } catch (error) {
    console.warn('API CoinGecko falhou, usando dados mock:', error)
    
    // Filtrar dados mock baseado na query
    const filteredMock = mockSearchCoins.filter(coin => 
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    )
    
    return { 
      data: filteredMock, 
      isMock: true, 
      error: 'Dados de demonstração - API indisponível' 
    }
  }
}