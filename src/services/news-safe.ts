import { mockNews, mockGlobalStats, type NewsItem, type GlobalStats } from './news-mock'

// Exportar tipos para uso externo
export type { NewsItem, GlobalStats }

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

// Interface para notícias do CryptoCompare
export interface CryptoCompareNewsItem {
  id: string
  guid: string
  published_on: number
  imageurl: string
  title: string
  url: string
  source: string
  body: string
  tags: string
  lang: string
  source_info: {
    name: string
    lang: string
    img: string
  }
}

// Função para buscar notícias com tratamento de erro
export async function fetchNewsSafe(categories: string[] = []): Promise<{ 
  data: NewsItem[]; 
  isMock: boolean; 
  error?: string 
}> {
  try {
    const lang = 'PT'
    const categoriesParam = categories.join(',')
    const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=${lang}&categories=${encodeURIComponent(categoriesParam)}`
    
    const response = await fetchWithTimeout(url, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`CryptoCompare error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.Data || !Array.isArray(data.Data)) {
      throw new Error('Formato de resposta inválido')
    }
    
    // Converter para nosso formato
    const news: NewsItem[] = data.Data.map((item: CryptoCompareNewsItem) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      url: item.url,
      imageurl: item.imageurl,
      source: item.source,
      tags: item.tags,
      published_on: item.published_on
    }))
    
    return { data: news, isMock: false }
    
  } catch (error) {
    console.warn('API CryptoCompare falhou, usando dados mock:', error)
    
    // Retornar dados mock em português
    return { 
      data: mockNews, 
      isMock: true, 
      error: 'Notícias de demonstração - API indisponível' 
    }
  }
}

// Função para buscar estatísticas globais com tratamento de erro
export async function fetchGlobalStatsSafe(): Promise<{ 
  data: GlobalStats['data']; 
  isMock: boolean; 
  error?: string 
}> {
  try {
    const url = 'https://api.coingecko.com/api/v3/global'
    
    const response = await fetchWithTimeout(url, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.data) {
      throw new Error('Formato de resposta inválido')
    }
    
    return { data: data.data, isMock: false }
    
  } catch (error) {
    console.warn('API CoinGecko Global falhou, usando dados mock:', error)
    
    // Retornar dados mock
    return { 
      data: mockGlobalStats.data, 
      isMock: true, 
      error: 'Estatísticas de demonstração - API indisponível' 
    }
  }
}

// Função para buscar notícias com retry
export async function fetchNewsWithRetry(categories: string[] = []): Promise<{ 
  data: NewsItem[]; 
  isMock: boolean; 
  error?: string 
}> {
  return fetchWithRetry(() => fetchNewsSafe(categories))
}

// Função para buscar estatísticas globais com retry
export async function fetchGlobalStatsWithRetry(): Promise<{ 
  data: GlobalStats['data']; 
  isMock: boolean; 
  error?: string 
}> {
  return fetchWithRetry(() => fetchGlobalStatsSafe())
}