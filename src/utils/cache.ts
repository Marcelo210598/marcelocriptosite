import { openDB, IDBPDatabase } from 'idb'
import { useState, useEffect } from 'react'

interface CacheConfig {
  name: string
  version: number
  stores: {
    [key: string]: {
      keyPath?: string
      autoIncrement?: boolean
      indexes?: Array<{
        name: string
        keyPath: string
        unique?: boolean
      }>
    }
  }
}

const DB_CONFIG: CacheConfig = {
  name: 'marcelo-cripto-cache',
  version: 1,
  stores: {
    coins: {
      keyPath: 'id',
      indexes: [
        { name: 'symbol', keyPath: 'symbol', unique: false },
        { name: 'lastUpdated', keyPath: 'lastUpdated', unique: false }
      ]
    },
    news: {
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'publishedAt', keyPath: 'publishedAt', unique: false },
        { name: 'category', keyPath: 'category', unique: false }
      ]
    },
    favorites: {
      keyPath: 'id',
      indexes: [
        { name: 'addedAt', keyPath: 'addedAt', unique: false }
      ]
    },
    marketStats: {
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false }
      ]
    }
  }
}

export class CryptoCache {
  private db: IDBPDatabase | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.db = await openDB(DB_CONFIG.name, DB_CONFIG.version, {
        upgrade(db) {
          // Criar stores
          Object.entries(DB_CONFIG.stores).forEach(([storeName, config]) => {
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, {
                keyPath: config.keyPath,
                autoIncrement: config.autoIncrement
              })

              // Criar indexes
              config.indexes?.forEach(index => {
                store.createIndex(index.name, index.keyPath, { unique: index.unique })
              })
            }
          })
        }
      })

      this.initialized = true
      console.log('Cache inicializado com sucesso')
    } catch (error) {
      console.error('Erro ao inicializar cache:', error)
      throw error
    }
  }

  async addCoin(coin: any): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    const coinWithTimestamp = {
      ...coin,
      lastUpdated: new Date().toISOString()
    }
    
    await this.db.put('coins', coinWithTimestamp)
  }

  async getCoin(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Cache não inicializado')
    return await this.db.get('coins', id)
  }

  async getAllCoins(): Promise<any[]> {
    if (!this.db) throw new Error('Cache não inicializado')
    return await this.db.getAll('coins')
  }

  async addNews(articles: any[]): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    const tx = this.db.transaction('news', 'readwrite')
    
    for (const article of articles) {
      await tx.store.put({
        ...article,
        cachedAt: new Date().toISOString()
      })
    }
    
    await tx.done
  }

  async getNews(limit = 20): Promise<any[]> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    const tx = this.db.transaction('news', 'readonly')
    const index = tx.store.index('publishedAt')
    
    // Pegar as notícias mais recentes
    const news = await index.getAll(null, limit)
    return news.reverse() // Ordenar por mais recente
  }

  async addFavorites(favorites: any[]): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    const tx = this.db.transaction('favorites', 'readwrite')
    await tx.store.clear() // Limpar favoritos antigos
    
    for (const fav of favorites) {
      await tx.store.put({
        ...fav,
        addedAt: new Date().toISOString()
      })
    }
    
    await tx.done
  }

  async getFavorites(): Promise<any[]> {
    if (!this.db) throw new Error('Cache não inicializado')
    return await this.db.getAll('favorites')
  }

  async addMarketStats(stats: any): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    await this.db.put('marketStats', {
      ...stats,
      id: 'current',
      timestamp: new Date().toISOString()
    })
  }

  async getMarketStats(): Promise<any | null> {
    if (!this.db) throw new Error('Cache não inicializado')
    return await this.db.get('marketStats', 'current')
  }

  async clearExpired(maxAge: number): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    const now = new Date().getTime()
    const expiredTime = now - maxAge
    
    // Limpar moedas antigas
    const coins = await this.db.getAll('coins')
    const expiredCoins = coins.filter(coin => 
      new Date(coin.lastUpdated).getTime() < expiredTime
    )
    
    for (const coin of expiredCoins) {
      await this.db.delete('coins', coin.id)
    }
    
    // Limpar notícias antigas
    const news = await this.db.getAll('news')
    const expiredNews = news.filter(article => 
      new Date(article.cachedAt).getTime() < expiredTime
    )
    
    for (const article of expiredNews) {
      await this.db.delete('news', article.id)
    }
    
    console.log(`Cache limpo: ${expiredCoins.length} moedas, ${expiredNews.length} notícias`)
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    await this.db.clear('coins')
    await this.db.clear('news')
    await this.db.clear('marketStats')
    
    console.log('Cache completamente limpo')
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) throw new Error('Cache não inicializado')
    
    const coins = await this.db.count('coins')
    const news = await this.db.count('news')
    const favorites = await this.db.count('favorites')
    
    return coins + news + favorites
  }
}

// Instância singleton
export const cryptoCache = new CryptoCache()

// Hook React para usar o cache
export const useCryptoCache = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    cryptoCache.initialize().then(() => {
      setIsReady(true)
    }).catch(error => {
      console.error('Erro ao inicializar cache:', error)
    })
  }, [])

  return {
    isReady,
    cache: cryptoCache
  }
}

// Hook simplificado para cache com refresh
export const useCache = () => {
  const refreshCache = async () => {
    try {
      await cryptoCache.clearAll()
      console.log('Cache atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar cache:', error)
    }
  }

  return {
    refreshCache
  }
}