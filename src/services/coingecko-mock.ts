import type { MarketCoin, CoinDetail, MarketChart, SearchCoin } from './coingecko'

// Dados mock realistas para demonstração
export const mockMarketCoins: MarketCoin[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 43250.75,
    market_cap: 847562345678,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.45,
    total_volume: 28456789012
  },
  {
    id: 'ethereum',
    symbol: 'eth', 
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 2650.32,
    market_cap: 318456789012,
    market_cap_rank: 2,
    price_change_percentage_24h: -1.23,
    total_volume: 15678901234
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'Binance Coin',
    image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
    current_price: 315.67,
    market_cap: 48567890123,
    market_cap_rank: 3,
    price_change_percentage_24h: 0.89,
    total_volume: 1234567890
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    current_price: 0.485,
    market_cap: 17234567890,
    market_cap_rank: 4,
    price_change_percentage_24h: 3.21,
    total_volume: 987654321
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 98.45,
    market_cap: 42345678901,
    market_cap_rank: 5,
    price_change_percentage_24h: -2.67,
    total_volume: 2345678901
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 0.612,
    market_cap: 33456789012,
    market_cap_rank: 6,
    price_change_percentage_24h: 1.87,
    total_volume: 1876543210
  },
  {
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    current_price: 7.23,
    market_cap: 9456789012,
    market_cap_rank: 7,
    price_change_percentage_24h: -0.45,
    total_volume: 345678901
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    current_price: 0.087,
    market_cap: 12345678901,
    market_cap_rank: 8,
    price_change_percentage_24h: 4.32,
    total_volume: 876543210
  }
]

export const mockCoinDetail: CoinDetail = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  description: 'Bitcoin é uma criptomoeda descentralizada que foi criada em 2009 por Satoshi Nakamoto. É a primeira e mais conhecida criptomoeda do mundo.',
  market_cap_rank: 1,
  current_price: { usd: 43250.75, brl: 215678.90, eur: 39876.45 },
  market_cap: { usd: 847562345678, brl: 4234567890123, eur: 781234567890 },
  total_volume: { usd: 28456789012, brl: 141234567890, eur: 26123456789 },
  price_change_percentage_24h: 2.45,
  sparkline_7d: Array.from({ length: 168 }, (_, i) => 42000 + Math.random() * 3000)
}

export const mockMarketChart: MarketChart = {
  prices: Array.from({ length: 168 }, (_, i) => [
    Date.now() - (167 - i) * 3600000,
    42000 + Math.sin(i * 0.1) * 2000 + (Math.random() - 0.5) * 1000
  ])
}

export const mockSearchCoins: SearchCoin[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png' },
  { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', thumb: 'https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', thumb: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png' }
]