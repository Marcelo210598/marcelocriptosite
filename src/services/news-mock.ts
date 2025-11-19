// Dados mock de notícias em português para demonstração
export interface NewsItem {
  id: string
  title: string
  body: string
  url: string
  imageurl: string
  source: string
  tags: string
  published_on: number
}

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin atinge novo máximo de 2024',
    body: 'A Bitcoin ultrapassou os $45.000 pela primeira vez este ano, impulsionada por expectativas positivas sobre a adoção institucional. Analistas acreditam que a tendência de alta pode continuar nos próximos meses.',
    url: 'https://exemplo.com/bitcoin-maximo-2024',
    imageurl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Bitcoin%20cryptocurrency%20price%20chart%20going%20up%2C%20green%20arrows%2C%20bullish%20market%20trend%2C%20professional%20financial%20background&image_size=landscape_16_9',
    source: 'CryptoNews',
    tags: 'Bitcoin|Market|Trading',
    published_on: Math.floor(Date.now() / 1000) - 3600
  },
  {
    id: '2',
    title: 'Ethereum 2.0 promete revolucionar DeFi',
    body: 'As atualizações do Ethereum continuam a atrair investidores, com a plataforma mantendo sua posição como líder em contratos inteligentes. Especialistas destacam o potencial de crescimento a longo prazo.',
    url: 'https://exemplo.com/ethereum-revolucao',
    imageurl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Ethereum%20blockchain%20technology%2C%20smart%20contracts%2C%20DeFi%20ecosystem%2C%20modern%20tech%20background%2C%20blue%20and%20purple%20colors&image_size=landscape_16_9',
    source: 'BlockchainPT',
    tags: 'Ethereum|DeFi|Technology',
    published_on: Math.floor(Date.now() / 1000) - 7200
  },
  {
    id: '3',
    title: 'Regulamentação cripto avança no Brasil',
    body: 'O Congresso Nacional discute novas medidas para regulamentar o mercado de criptomoedas no Brasil, trazendo mais segurança para investidores e impulsionando a adoção institucional.',
    url: 'https://exemplo.com/regulamentacao-brasil',
    imageurl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Brazilian%20government%20building%2C%20cryptocurrency%20regulation%2C%20official%20documents%2C%20Brazilian%20flag%2C%20professional%20government%20setting&image_size=landscape_16_9',
    source: 'GovBrasil',
    tags: 'Regulation|Brazil|Government',
    published_on: Math.floor(Date.now() / 1000) - 10800
  },
  {
    id: '4',
    title: 'Solana registra aumento de 150% em transações',
    body: 'A rede Solana continua impressionando com seu desempenho, registrando um aumento significativo no número de transações processadas. A escalabilidade da plataforma tem atraído novos projetos.',
    url: 'https://exemplo.com/solana-transacoes',
    imageurl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Solana%20blockchain%20network%2C%20fast%20transactions%2C%20high%20speed%20connections%2C%20green%20performance%20arrows%2C%20modern%20tech%20visualization&image_size=landscape_16_9',
    source: 'SolanaNews',
    tags: 'Solana|Blockchain|Performance',
    published_on: Math.floor(Date.now() / 1000) - 14400
  },
  {
    id: '5',
    title: 'NFTs ganham nova vida no mercado digital',
    body: 'O mercado de NFTs está mostrando sinais de recuperação, com novos casos de uso sendo explorados além da arte digital. Empresas estão descobrindo aplicações práticas para tokens não fungíveis.',
    url: 'https://exemplo.com/nft-mercado',
    imageurl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=NFT%20digital%20art%20gallery%2C%20colorful%20digital%20collectibles%2C%20modern%20art%20exhibition%2C%20technology%20and%20creativity%20fusion&image_size=landscape_16_9',
    source: 'NFTBrasil',
    tags: 'NFT|Market|Digital',
    published_on: Math.floor(Date.now() / 1000) - 18000
  },
  {
    id: '6',
    title: 'DeFi alcança $100 bilhões em valor travado',
    body: 'O setor DeFi continua sua expansão impressionante, ultrapassando a marca de $100 bilhões em valor total travado. O crescimento demonstra a confiança crescente dos investidores em protocolos descentralizados.',
    url: 'https://exemplo.com/defi-100-bilhoes',
    imageurl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=DeFi%20ecosystem%2C%20decentralized%20finance%20visualization%2C%20growing%20charts%2C%20blockchain%20connections%2C%20blue%20and%20green%20tech%20theme&image_size=landscape_16_9',
    source: 'DeFiWatch',
    tags: 'DeFi|Market|Growth',
    published_on: Math.floor(Date.now() / 1000) - 21600
  }
]

// Estatísticas globais mock
export interface GlobalStats {
  data: {
    active_cryptocurrencies: number
    upcoming_icos: number
    ongoing_icos: number
    ended_icos: number
    markets: number
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_percentage: Record<string, number>
    market_cap_change_percentage_24h_usd: number
    updated_at: number
  }
}

export const mockGlobalStats: GlobalStats = {
  data: {
    active_cryptocurrencies: 8500,
    upcoming_icos: 15,
    ongoing_icos: 42,
    ended_icos: 1250,
    markets: 420,
    total_market_cap: {
      usd: 1650000000000, // $1.65T
      brl: 8250000000000, // R$ 8.25T
      eur: 1510000000000   // €1.51T
    },
    total_volume: {
      usd: 65000000000,   // $65B
      brl: 325000000000,  // R$ 325B
      eur: 59500000000    // €59.5B
    },
    market_cap_percentage: {
      btc: 42.5,
      eth: 18.3,
      usdt: 6.8,
      bnb: 4.2,
      sol: 3.1
    },
    market_cap_change_percentage_24h_usd: 2.45,
    updated_at: Math.floor(Date.now() / 1000)
  }
}