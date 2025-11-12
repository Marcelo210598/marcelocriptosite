import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchMarketChart, fetchMarkets, fetchSearchCoins } from '../services/coingecko'
import type { MarketCoin, SearchCoin } from '../services/coingecko'

type Point = [number, number]

function sma(points: Point[], window: number): Point[] {
  const out: Point[] = []
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const v = points[i][1]
    sum += v
    if (i >= window) sum -= points[i - window][1]
    if (i >= window - 1) out.push([points[i][0], sum / window])
  }
  return out
}

function rsi(points: Point[], period = 14): Point[] {
  if (points.length < period + 1) return []
  const out: Point[] = []
  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i++) {
    const change = points[i][1] - points[i - 1][1]
    if (change >= 0) gain += change
    else loss -= change
  }
  gain /= period
  loss /= period
  out.push([points[period][0], loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)])
  for (let i = period + 1; i < points.length; i++) {
    const change = points[i][1] - points[i - 1][1]
    const g = change > 0 ? change : 0
    const l = change < 0 ? -change : 0
    // Wilder smoothing
    gain = (gain * (period - 1) + g) / period
    loss = (loss * (period - 1) + l) / period
    const rs = loss === 0 ? Infinity : gain / loss
    const value = loss === 0 ? 100 : 100 - 100 / (1 + rs)
    out.push([points[i][0], value])
  }
  return out
}

function ema(points: Point[], period: number): Point[] {
  if (points.length < period) return []
  const out: Point[] = []
  const k = 2 / (period + 1)
  // seed with SMA
  let seed = 0
  for (let i = 0; i < period; i++) seed += points[i][1]
  seed /= period
  out.push([points[period - 1][0], seed])
  for (let i = period; i < points.length; i++) {
    const price = points[i][1]
    const prev = out[out.length - 1][1]
    const next = price * k + prev * (1 - k)
    out.push([points[i][0], next])
  }
  return out
}

function computeMACD(points: Point[]): { macd: Point[]; signal: Point[]; hist: Point[] } {
  const e12 = ema(points, 12)
  const e26 = ema(points, 26)
  if (!e12.length || !e26.length) return { macd: [], signal: [], hist: [] }
  // align by timestamp
  const byTs = new Map<number, number>()
  e26.forEach((p) => byTs.set(p[0], p[1]))
  const macd: Point[] = []
  for (const [t, v12] of e12) {
    const v26 = byTs.get(t)
    if (v26 != null) macd.push([t, v12 - v26])
  }
  const signal = ema(macd, 9)
  const hist: Point[] = []
  const sByTs = new Map<number, number>()
  signal.forEach((p) => sByTs.set(p[0], p[1]))
  for (const [t, m] of macd) {
    const s = sByTs.get(t)
    if (s != null) hist.push([t, m - s])
  }
  return { macd, signal, hist }
}

function bollinger(points: Point[], period = 20, mult = 2): { mid: Point[]; upper: Point[]; lower: Point[] } {
  const mid: Point[] = []
  const upper: Point[] = []
  const lower: Point[] = []
  if (points.length < period) return { mid, upper, lower }
  const win: number[] = []
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const v = points[i][1]
    win.push(v)
    sum += v
    if (win.length > period) sum -= win.shift() as number
    if (win.length === period) {
      const mean = sum / period
      let varSum = 0
      for (let j = 0; j < win.length; j++) varSum += (win[j] - mean) ** 2
      const std = Math.sqrt(varSum / period)
      const t = points[i][0]
      mid.push([t, mean])
      upper.push([t, mean + mult * std])
      lower.push([t, mean - mult * std])
    }
  }
  return { mid, upper, lower }
}

function ChartLine({ points, color = '#60a5fa', height = 220 }: { points: Point[]; color?: string; height?: number }) {
  if (!points || points.length < 2) return <div className="text-xs text-zinc-500">Sem dados</div>
  const w = 700
  const h = height
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const minX = xs[0]
  const maxX = xs[xs.length - 1]
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * w
  const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  )
}

function ChartOverlay({ base, overlays }: { base: Point[]; overlays: { points: Point[]; color: string }[] }) {
  const w = 700
  const h = 220
  if (!base || base.length < 2) return <div className="text-xs text-zinc-500">Sem dados</div>
  const xs = base.map((p) => p[0])
  const ys = base.map((p) => p[1])
  const minX = xs[0]
  const maxX = xs[xs.length - 1]
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * w
  const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
  const dBase = base.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
  const paths = overlays.map(({ points, color }, idx) => {
    const d = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`)
      .join(' ')
    return <path key={idx} d={d} fill="none" stroke={color} strokeWidth={1.5} />
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <path d={dBase} fill="none" stroke="#60a5fa" strokeWidth={2} />
      {paths}
    </svg>
  )
}

function ChartRSI({ points }: { points: Point[] }) {
  const w = 700
  const h = 160
  if (!points || points.length < 2) return <div className="text-xs text-zinc-500">Sem dados</div>
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const minX = xs[0]
  const maxX = xs[xs.length - 1]
  const minY = 0
  const maxY = 100
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * w
  const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`)
    .join(' ')
  const y30 = scaleY(30)
  const y70 = scaleY(70)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[${h}px]">
      <line x1={0} x2={w} y1={y30} y2={y30} stroke="#f59e0b" strokeDasharray="4 4" />
      <line x1={0} x2={w} y1={y70} y2={y70} stroke="#f59e0b" strokeDasharray="4 4" />
      <path d={d} fill="none" stroke="#34d399" strokeWidth={2} />
    </svg>
  )
}

function ChartMACD({ macd, signal, hist }: { macd: Point[]; signal: Point[]; hist: Point[] }) {
  const w = 700
  const h = 160
  if (!macd.length || !signal.length || !hist.length) return <div className="text-xs text-zinc-500">Sem dados</div>
  const xs = macd.map((p) => p[0])
  const minX = xs[0]
  const maxX = xs[xs.length - 1]
  const vals = [
    ...macd.map((p) => p[1]),
    ...signal.map((p) => p[1]),
    ...hist.map((p) => p[1]),
    0,
  ]
  const minY = Math.min(...vals)
  const maxY = Math.max(...vals)
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * w
  const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
  const dMacd = macd.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
  const dSignal = signal.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
  const barW = w / hist.length
  const bars = hist.map((p, i) => {
    const x = scaleX(p[0]) - barW / 2
    const y0 = scaleY(0)
    const y1 = scaleY(p[1])
    const height = Math.abs(y1 - y0)
    const y = Math.min(y0, y1)
    const color = p[1] >= 0 ? '#22c55e' : '#ef4444'
    return <rect key={i} x={x} y={y} width={barW * 0.8} height={height} fill={color} opacity={0.6} />
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      {bars}
      <path d={dMacd} fill="none" stroke="#60a5fa" strokeWidth={2} />
      <path d={dSignal} fill="none" stroke="#f59e0b" strokeWidth={2} />
    </svg>
  )
}

function ChartBands({ base, upper, lower }: { base: Point[]; upper: Point[]; lower: Point[] }) {
  const w = 700
  const h = 220
  if (!base.length || !upper.length || !lower.length) return <div className="text-xs text-zinc-500">Sem dados</div>
  const xs = base.map((p) => p[0])
  const ys = base.map((p) => p[1])
  const minX = xs[0]
  const maxX = xs[xs.length - 1]
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * w
  const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
  const dUpper = upper.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
  const dLower = lower.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
  // area path: upper forward + lower backward
  const areaPath = [
    ...upper.map((p) => `${scaleX(p[0]).toFixed(2)},${scaleY(p[1]).toFixed(2)}`),
    ...lower.slice().reverse().map((p) => `${scaleX(p[0]).toFixed(2)},${scaleY(p[1]).toFixed(2)}`),
  ].join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <polygon points={areaPath} fill="#60a5fa22" stroke="none" />
      <path d={dUpper} fill="none" stroke="#22c55e" strokeWidth={1.5} />
      <path d={dLower} fill="none" stroke="#ef4444" strokeWidth={1.5} />
    </svg>
  )
}

// Textos fundamentais resumidos para as maiores criptomoedas
const FUNDAMENTAL_TEXTS: Record<string, { title: string; subtitle?: string; paragraphs: string[]; risks?: string[]; catalysts?: string[] }> = {
  bitcoin: {
    title: 'Análise fundamentalista: Bitcoin (BTC)',
    subtitle: 'Criado em 2008 (whitepaper) e lançado em 2009 (rede)',
    paragraphs: [
      'O Bitcoin é um protocolo monetário aberto, sem fronteiras e resistente à censura. Seu valor deriva da credibilidade da política monetária (oferta limitada), da segurança ancorada em prova de trabalho e da descentralização material da rede.',
      'A emissão é previsível: a oferta máxima é de 21 milhões de BTC, com eventos de halving aproximadamente a cada 4 anos, reduzindo o subsídio de bloco. Isso tende a pressionar a relação oferta/demanda ao longo dos ciclos e sustenta a narrativa de “ouro digital”.',
      'Segurança e resiliência: o hashrate crescente indica investimento em infraestrutura de mineração e maior segurança econômica contra ataques. A distribuição de nós e a diversidade de jurisdições adicionam robustez contra pontos únicos de falha.',
      'Métricas on-chain úteis incluem atividade de endereços, taxas pagas, fluxos de exchange, Realized Cap e indicadores de lucro/perda (ex.: MVRV, NUPL). Em ciclos de expansão, taxas e atividade aumentam; já em contrações, há queda de demanda por transações e compressão de múltiplos.',
      'A adoção institucional foi impulsionada por veículos regulados (ex.: ETFs spot), custódia profissional e integração com tesourarias. Em varejo, soluções de segunda camada como Lightning tornam pagamentos mais viáveis e ampliam a utilidade transacional.',
      'Valuation e drivers: não há modelo único, mas proxies como fees/segurança, dinâmica de liquidez global, dólar/juros reais, e efeito de rede ajudam a explicar ciclos. Em ambientes de liquidez restrita, a correlação com ativos de risco tende a subir.',
    ],
    risks: [
      'Regulação restritiva e incerteza fiscal em diferentes jurisdições.',
      'Concentração regional de hashing e riscos em fornecimento de energia.',
      'Alta correlação com liquidez global e ciclos macro.',
      'Narrativas negativas em mídia e mudanças no apetite institucional.',
    ],
    catalysts: [
      'ETF spot e crescimento de custódia institucional.',
      'Avanço de Lightning e soluções L2 para pagamentos escaláveis.',
      'Narrativa de proteção contra inflação e digitalização de reservas.',
      'Aumento de integração em apps financeiros e carteiras globais.',
    ],
  },
  ethereum: {
    title: 'Análise fundamentalista: Ethereum (ETH)',
    subtitle: 'Plataforma de contratos inteligentes; migrou para Proof of Stake (The Merge)',
    paragraphs: [
      'Ethereum é a principal plataforma de contratos inteligentes, hospedando DeFi, NFTs, jogos e casos corporativos. O valor do ETH advém da utilidade como “gás” e dos fluxos econômicos que remuneram segurança e validadores.',
      'Após o The Merge, a transição para Proof of Stake reduziu emissões. Com EIP-1559, parte das taxas é queimada, podendo gerar dinâmica de oferta neutra ou deflacionária nas fases de alta atividade.',
      'Escala e custos: L2s (rollups) consolidam execução com taxas baixas; inovações como proto-danksharding/danksharding visam throughput e latência melhores. A experiência do desenvolvedor e ferramentas aceleram novos casos.',
      'Métricas relevantes: gas usado, número de transações, participação de L2s nas fees, TVL de DeFi, volume de DEX, staking ratio e composição dos validadores. A diversificação do ecossistema tende a atrair novos fluxos e casos de receita.',
      'Riscos incluem centralização relativa em ambientes de staking e operadores, pressões regulatórias sobre stablecoins/DeFi, e desafios de segurança em pontes e rollups. A governança técnica e coordenação comunitária são ativos, mas exigem constante evolução.',
    ],
    risks: [
      'Competição de L1s focadas em performance e custos.',
      'Centralização relativa do staking e concentração de operadores.',
      'Riscos regulatórios em stablecoins, DeFi e NFTs.',
      'Falhas em pontes/rollups e fragmentação de liquidez entre L2s.',
    ],
    catalysts: [
      'Proto/danksharding e L2s reduzindo custos de transação.',
      'Expansão de RWA, social e gaming, gerando uso recorrente.',
      'Integração corporativa e instrumentação regulada em DeFi.',
    ],
  },
  binancecoin: {
    title: 'Análise fundamentalista: BNB (Binance Coin)',
    subtitle: 'Moeda utilitária do ecossistema Binance, incluindo BNB Chain',
    paragraphs: [
      'BNB é um ativo utilitário no ecossistema Binance e funciona como gás na BNB Chain. O valor está ligado a sua utilidade em taxas, descontos e a atividade na cadeia.',
      'A BNB Chain oferece ambiente de dApps com foco em baixo custo e alto throughput. Volumes de negociação, usuários ativos e projetos relevantes sustentam a demanda por BNB.',
      'Queimas periódicas e mecanismos de redução de oferta reforçam a tese de utilidade. A governança e o roadmap técnico influenciam percepção de risco e confiança.',
      'A exposição regulatória e a dependência do ecossistema Binance são pontos críticos: qualquer restrição a serviços/negócios pode afetar demanda e liquidez.',
    ],
    risks: [
      'Dependência do ecossistema Binance e riscos regulatórios associados.',
      'Concentração de governança e exposição a decisões corporativas.',
      'Segurança de bridges e integração com outras redes.',
    ],
    catalysts: [
      'Crescimento de dApps com uso real e adesão de usuários.',
      'Expansão internacional e ganhos de performance da cadeia.',
    ],
  },
  solana: {
    title: 'Análise fundamentalista: Solana (SOL)',
    subtitle: 'Camada 1 de alto desempenho, foco em throughput e baixos custos',
    paragraphs: [
      'Solana prioriza alta performance e taxas baixas, o que viabiliza experiências ricas em DeFi, jogos, NFTs e apps consumer. A execução paralela e arquitetura técnica são diferenciais.',
      'Evolução do cliente (ex.: Firedancer) e foco em estabilidade aumentam resiliência. Histórico de quedas é um ponto de atenção, mas melhorias têm reduzido incidências.',
      'Métricas observáveis: TPS efetivo, falhas/incidentes, custos médios por transação, volume de DEX, usuários ativos e crescimento de carteiras. A presença de apps consumer bem-sucedidos pode atrair novos fluxos.',
      'Concorrência com outras L1s e L2s exige ecossistema vibrante e ferramentas de desenvolvimento acessíveis. Incentivos a projetos e a criadores ajudam a acelerar a adoção.',
    ],
    risks: [
      'Quedas históricas e desafios de estabilidade (em redução).',
      'Centralização relativa e exigência de hardware robusto.',
      'Riscos de MEV e coordenação de validadores.',
    ],
    catalysts: [
      'Melhorias de clientes/infra e estabilidade contínua.',
      'Apps consumer (social, pagamentos, gaming) ganhando escala.',
    ],
  },
  ripple: {
    title: 'Análise fundamentalista: XRP (Ripple)',
    subtitle: 'Foco em pagamentos e liquidações entre instituições financeiras',
    paragraphs: [
      'XRP é desenhado para liquidações rápidas e baratas, com foco em remessas e integrações com instituições financeiras via RippleNet e ODL.',
      'Casos práticos dependem de parcerias com bancos e provedores de pagamento; a expansão de corredores de liquidez melhora experiência e reduz custos.',
      'A clareza regulatória tem impacto direto na adoção. Decisões legais favoráveis, padrões de compliance e conformidade em diferentes países destravam uso.',
      'Competição com redes de pagamentos tradicionais e soluções cripto exige diferenciais claros em custo, velocidade e integração técnica.',
    ],
    risks: [
      'Litígios e riscos regulatórios persistentes em várias jurisdições.',
      'Dependência de parcerias institucionais e aceitação bancária.',
      'Concorrência de redes de pagamentos e alternativas cripto.',
    ],
    catalysts: [
      'Decisões legais favoráveis e aprovação de modelos de uso.',
      'Expansão de corredores de liquidez e integrações com bancos.',
    ],
  },
  cardano: {
    title: 'Análise fundamentalista: Cardano (ADA)',
    subtitle: 'Pesquisa acadêmica, desenvolvimento formal e camadas modulares',
    paragraphs: [
      'Cardano enfatiza pesquisa e desenvolvimento formal, com entregas voltadas a segurança e robustez. O modelo UTxO estendido traz benefícios e desafios ao design de dApps.',
      'Escalabilidade e interoperabilidade são frentes constantes: soluções como Hydra, otimizações de nó e ferramentas de dev visam melhor performance.',
      'Adoção prática depende de dApps úteis, UX consistente e liquidez. Comunidade engajada e governança propostas via CIP movem o roadmap.',
      'Integrações com outras redes, pontes e suporte a padrões amplia casos. Educação e parcerias institucionais podem acelerar uso real.',
    ],
    risks: [
      'Adoção lenta frente a concorrentes com maior tração.',
      'Complexidade de desenvolvimento e ritmo de entregas.',
    ],
    catalysts: [
      'Entregas de escalabilidade (Hydra, otimizações) e interoperabilidade.',
      'Parcerias educacionais/governamentais e crescimento de dApps.',
    ],
  },
  dogecoin: {
    title: 'Análise fundamentalista: Dogecoin (DOGE)',
    subtitle: 'Moeda inspirada em meme com grande comunidade',
    paragraphs: [
      'Dogecoin se apoia em força de comunidade e alcance cultural de narrativas meme. A utilidade em pagamentos e integrações com empresas reforçam demanda.',
      'A inflação contínua limita escassez, exigindo casos de uso práticos para sustentar valor. Parcerias, aceitação em comércio e integrações em carteiras ajudam.',
      'Volatilidade e sensibilidade a eventos/figuras públicas são traços marcantes. A infraestrutura e ferramentas podem evoluir para melhorar UX e segurança.',
    ],
    risks: [
      'Alta volatilidade e dependência de narrativa pública.',
      'Baixa utilidade técnica intrínseca frente a concorrentes.',
    ],
    catalysts: [
      'Integrações de pagamentos e apoio de empresas/marcas.',
      'Ciclos de hype e ampliações de adoção em varejo.',
    ],
  },
  toncoin: {
    title: 'Análise fundamentalista: Toncoin (TON)',
    subtitle: 'Ecossistema ligado ao Telegram, foco em experiência de usuário',
    paragraphs: [
      'TON se beneficia da base de usuários do Telegram, integrando carteiras e miniapps para experiência fluida. O onboarding simples é um diferencial competitivo.',
      'Casos de uso práticos (transferências, jogos, apps sociais) e incentivos estimulam adoção. Ferramentas de dev e documentação melhoram tempo de lançamento.',
      'Métricas relevantes incluem usuários ativos de carteira, volume transacional e retenção em miniapps. Liquidez e integração com exchanges ampliam alcance.',
      'Segurança de contratos e bridges, além de dependência de plataforma externa, são pontos de atenção. A resiliência técnica e governança precisam acompanhar crescimento.',
    ],
    risks: [
      'Dependência de plataforma externa e riscos regulatórios.',
      'Segurança de contratos e bridges conforme ecossistema expande.',
    ],
    catalysts: [
      'Produtos nativos no Telegram e expansão de carteiras.',
      'Incentivos a desenvolvedores e usuários em miniapps.',
    ],
  },
}

// Estatísticas do período: retorno (%), volatilidade anualizada (%), drawdown máximo (%)
function computeStats(points: Point[]) {
  if (!points || points.length < 2) {
    return {
      returnPct: 0,
      volAnnPct: 0,
      maxDrawdownPct: 0,
      startTs: undefined as number | undefined,
      endTs: undefined as number | undefined,
    }
  }
  const first = points[0][1]
  const last = points[points.length - 1][1]
  const returnPct = ((last / first) - 1) * 100
  // log-returns
  const logRets: number[] = []
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1][1]
    const p1 = points[i][1]
    logRets.push(Math.log(p1 / p0))
  }
  const mean = logRets.reduce((a, b) => a + b, 0) / logRets.length
  const varSum = logRets.reduce((acc, r) => acc + (r - mean) ** 2, 0)
  const stdev = Math.sqrt(varSum / Math.max(1, logRets.length - 1))
  const totalMs = points[points.length - 1][0] - points[0][0]
  const avgStepMs = totalMs / (points.length - 1)
  const msPerYear = 365 * 24 * 60 * 60 * 1000
  const stepsPerYear = msPerYear / Math.max(1, avgStepMs)
  const volAnnPct = stdev * Math.sqrt(stepsPerYear) * 100
  // max drawdown
  let peak = points[0][1]
  let maxDd = 0
  for (let i = 1; i < points.length; i++) {
    const v = points[i][1]
    if (v > peak) peak = v
    const dd = v / peak - 1
    if (dd < maxDd) maxDd = dd
  }
  const maxDrawdownPct = maxDd * 100
  return {
    returnPct,
    volAnnPct,
    maxDrawdownPct,
    startTs: points[0][0],
    endTs: points[points.length - 1][0],
  }
}

function StatsPanel({ stats }: { stats: { returnPct: number; volAnnPct: number; maxDrawdownPct: number; startTs?: number; endTs?: number } }) {
  const fmtPct = (n: number) => `${(n).toFixed(2)}%`
  const fmtDate = (ts?: number) => ts ? new Date(ts).toLocaleDateString() : '-'
  return (
    <div className="mt-4 rounded border border-zinc-700 bg-zinc-900 p-4">
      <div className="text-sm text-zinc-400 mb-2">Estatísticas do período</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="rounded border border-zinc-700 p-3">
          <div className="text-zinc-400">Retorno</div>
          <div className={`mt-1 font-semibold ${stats.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtPct(stats.returnPct)}</div>
        </div>
        <div className="rounded border border-zinc-700 p-3">
          <div className="text-zinc-400">Volatilidade anualizada</div>
          <div className="mt-1 font-semibold text-indigo-300">{fmtPct(stats.volAnnPct)}</div>
        </div>
        <div className="rounded border border-zinc-700 p-3">
          <div className="text-zinc-400">Drawdown máximo</div>
          <div className="mt-1 font-semibold text-red-300">{fmtPct(stats.maxDrawdownPct)}</div>
        </div>
        <div className="rounded border border-zinc-700 p-3">
          <div className="text-zinc-400">Período</div>
          <div className="mt-1 font-semibold text-zinc-200">{fmtDate(stats.startTs)} — {fmtDate(stats.endTs)}</div>
        </div>
      </div>
    </div>
  )
}

export default function Analises(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const [id, setId] = useState<string>(() => searchParams.get('id') ?? 'bitcoin')
  const [vs, setVs] = useState<'usd' | 'brl' | 'eur'>(() => {
    const p = (searchParams.get('vs') ?? 'usd').toLowerCase()
    return ['usd','brl','eur'].includes(p) ? (p as any) : 'usd'
  })
  const [rangeDays, setRangeDays] = useState<30 | 90 | 180 | 365>(() => {
    const r = Number(searchParams.get('range') ?? 90)
    return (r === 30 || r === 90 || r === 180 || r === 365) ? (r as any) : 90
  })
  const [topCoins, setTopCoins] = useState<MarketCoin[]>([])
  const [showSMA7, setShowSMA7] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('sma7'))
  const [showSMA30, setShowSMA30] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('sma30'))
  const [showRSI, setShowRSI] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('rsi'))
  const [showEMA12, setShowEMA12] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('ema12'))
  const [showEMA26, setShowEMA26] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('ema26'))
  const [showMACD, setShowMACD] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('macd'))
  const [showBB, setShowBB] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('bb'))
  const [showStats, setShowStats] = useState<boolean>(() => (searchParams.get('ind') ?? '').includes('stats'))
  const [compareEnabled, setCompareEnabled] = useState<boolean>(() => !!searchParams.get('id2'))
  const [id2, setId2] = useState<string | null>(() => searchParams.get('id2'))
  const [chart, setChart] = useState<Point[]>([])
  const [chart2, setChart2] = useState<Point[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([])
  const [searchQ2, setSearchQ2] = useState<string>('')
  const [searchResults2, setSearchResults2] = useState<SearchCoin[]>([])
  const [presets, setPresets] = useState<{ name: string; query: Record<string, string> }[]>([])
  const [presetName, setPresetName] = useState<string>('')
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetchMarketChart({ id, vsCurrency: vs, days: rangeDays })
      .then((d) => { if (active) setChart(d.prices) })
      .catch((e) => { if (active) { setError(e?.message ?? 'Falha ao carregar histórico'); setChart([]) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, vs, rangeDays])

  // Carregar gráfico da moeda de comparação
  useEffect(() => {
    let active = true
    if (compareEnabled && id2) {
      fetchMarketChart({ id: id2, vsCurrency: vs, days: rangeDays })
        .then((d) => { if (active) setChart2(d.prices) })
        .catch(() => { if (active) setChart2([]) })
    } else {
      setChart2([])
    }
    return () => { active = false }
  }, [compareEnabled, id2, vs, rangeDays])

  // Carregar top moedas por valor de mercado para navegação rápida
  useEffect(() => {
    let active = true
    fetchMarkets({ vsCurrency: vs, perPage: 12, page: 1, order: 'market_cap_desc' })
      .then((coins) => { if (active) setTopCoins(coins) })
      .catch(() => { if (active) setTopCoins([]) })
    return () => { active = false }
  }, [vs])

  // Sync URL (unificado)
  useEffect(() => {
    const ind = buildInd()
    const params: Record<string, string> = { id, vs, range: String(rangeDays), ind }
    if (compareEnabled && id2) params['id2'] = id2
    setSearchParams(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, vs, rangeDays, showSMA7, showSMA30, showRSI, showEMA12, showEMA26, showMACD, showBB, showStats, compareEnabled, id2])

  const sma7 = useMemo(() => (showSMA7 ? sma(chart, 7) : []), [chart, showSMA7])
  const sma30 = useMemo(() => (showSMA30 ? sma(chart, 30) : []), [chart, showSMA30])
  const rsi14 = useMemo(() => (showRSI ? rsi(chart, 14) : []), [chart, showRSI])
  const ema12 = useMemo(() => (showEMA12 ? ema(chart, 12) : []), [chart, showEMA12])
  const ema26 = useMemo(() => (showEMA26 ? ema(chart, 26) : []), [chart, showEMA26])
  const macdData = useMemo(() => (showMACD ? computeMACD(chart) : { macd: [], signal: [], hist: [] }), [chart, showMACD])
  const bb20 = useMemo(() => (showBB ? bollinger(chart, 20, 2) : { mid: [], upper: [], lower: [] }), [chart, showBB])
  const stats = useMemo(() => (showStats ? computeStats(chart) : { returnPct: 0, volAnnPct: 0, maxDrawdownPct: 0, startTs: undefined, endTs: undefined }), [chart, showStats])

  // Busca de moedas (primária)
  useEffect(() => {
    let active = true
    const t = setTimeout(() => {
      fetchSearchCoins(searchQ).then((res) => { if (active) setSearchResults(res) }).catch(() => { if (active) setSearchResults([]) })
    }, 300)
    return () => { active = false; clearTimeout(t) }
  }, [searchQ])

  // Busca de moedas (comparação)
  useEffect(() => {
    let active = true
    const t = setTimeout(() => {
      fetchSearchCoins(searchQ2).then((res) => { if (active) setSearchResults2(res) }).catch(() => { if (active) setSearchResults2([]) })
    }, 300)
    return () => { active = false; clearTimeout(t) }
  }, [searchQ2])

  // Presets: carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('analysis_presets')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setPresets(arr)
      }
    } catch {}
  }, [])

  function buildInd(): string {
    return [
      showSMA7 ? 'sma7' : null,
      showSMA30 ? 'sma30' : null,
      showRSI ? 'rsi' : null,
      showEMA12 ? 'ema12' : null,
      showEMA26 ? 'ema26' : null,
      showMACD ? 'macd' : null,
      showBB ? 'bb' : null,
      showStats ? 'stats' : null,
    ].filter(Boolean).join(',')
  }

  function savePreset() {
    const name = (presetName || 'Preset').trim()
    const ind = buildInd()
    const q: Record<string, string> = { id, vs, range: String(rangeDays), ind }
    if (compareEnabled && id2) q['id2'] = id2
    try {
      const raw = localStorage.getItem('analysis_presets')
      const arr: { name: string; query: Record<string, string> }[] = raw ? JSON.parse(raw) : []
      const filtered = arr.filter((p) => p.name !== name)
      filtered.push({ name, query: q })
      localStorage.setItem('analysis_presets', JSON.stringify(filtered))
      setPresets(filtered)
      setSelectedPreset(name)
    } catch {}
  }

  function applyPresetByName(name: string) {
    const p = presets.find((x) => x.name === name)
    if (!p) return
    const q = p.query
    setId(q.id || id)
    setVs(((q.vs || vs) as any))
    const rNum = Number(q.range ?? rangeDays)
    setRangeDays((rNum === 30 || rNum === 90 || rNum === 180 || rNum === 365) ? (rNum as any) : rangeDays)
    const indStr = q.ind || ''
    setShowSMA7(indStr.includes('sma7'))
    setShowSMA30(indStr.includes('sma30'))
    setShowRSI(indStr.includes('rsi'))
    setShowEMA12(indStr.includes('ema12'))
    setShowEMA26(indStr.includes('ema26'))
    setShowMACD(indStr.includes('macd'))
    setShowBB(indStr.includes('bb'))
    setShowStats(indStr.includes('stats'))
    const newId2 = q.id2
    setCompareEnabled(!!newId2)
    setId2(newId2 ?? null)
  }

  function copyLink() {
    const ind = buildInd()
    const params = new URLSearchParams({ id, vs, range: String(rangeDays), ind })
    if (compareEnabled && id2) params.set('id2', id2)
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    try { navigator.clipboard.writeText(url) } catch {}
  }

  function normalize(points: Point[]): Point[] {
    if (!points.length) return []
    const base = points[0][1]
    return points.map(([t, v]) => [t, (v / base) * 100])
  }

  function alignByTimestamp(a: Point[], b: Point[]): { a: Point[]; b: Point[] } {
    const mapB = new Map(b.map(([t, v]) => [t, v]))
    const outA: Point[] = []
    const outB: Point[] = []
    for (const [t, va] of a) {
      const vb = mapB.get(t)
      if (vb != null) { outA.push([t, va]); outB.push([t, vb]) }
    }
    return { a: outA, b: outB }
  }

  function ChartCompareNormalized({ base, other, labelBase, labelOther }: { base: Point[]; other: Point[]; labelBase: string; labelOther: string }) {
    const w = 700
    const h = 220
    if (!base.length || !other.length) return <div className="text-xs text-zinc-500">Sem dados</div>
    const xs = base.map((p) => p[0])
    const minX = xs[0]
    const maxX = xs[xs.length - 1]
    const ys = [...base.map((p) => p[1]), ...other.map((p) => p[1])]
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * w
    const scaleY = (y: number) => h - ((y - minY) / (maxY - minY)) * h
    const dA = base.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
    const dB = other.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p[0]).toFixed(2)} ${scaleY(p[1]).toFixed(2)}`).join(' ')
  return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
        <path d={dA} fill="none" stroke="#60a5fa" strokeWidth={2} />
        <path d={dB} fill="none" stroke="#f59e0b" strokeWidth={2} />
        <text x={8} y={16} className="fill-zinc-400 text-[10px]">{labelBase}</text>
        <text x={8} y={32} className="fill-zinc-400 text-[10px]">{labelOther}</text>
      </svg>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-2xl font-bold">Análises técnicas</h2>
      <p className="mt-2 text-zinc-400">Selecione moeda, moeda base e intervalo; ative indicadores.</p>

      {/* Navegação rápida pelas maiores criptomoedas */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Maiores criptomoedas por valor de mercado</h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(topCoins.length ? topCoins : []).slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => setId(c.id)}
              className={`flex items-center gap-2 rounded border px-3 py-2 text-left transition ${id === c.id ? 'border-indigo-400 bg-indigo-500/10' : 'border-zinc-700 hover:border-zinc-500'}`}
            >
              <img src={c.image} alt={c.name} className="h-5 w-5 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium">{c.name} <span className="text-xs text-zinc-400">({c.symbol.toUpperCase()})</span></div>
                <div className="text-xs text-zinc-500">Rank #{c.market_cap_rank ?? '-'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {/* Busca rápida de moeda principal */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Buscar:</label>
          <div className="relative">
            <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Digite nome ou símbolo" className="w-40 rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white" />
            {searchQ && searchResults.length > 0 && (
              <div className="absolute left-0 top-full mt-2 z-10 w-64 rounded border border-zinc-700 bg-zinc-900 p-2">
                {searchResults.map((c) => (
                  <button key={c.id} onClick={() => { setId(c.id); setSearchQ(''); setSearchResults([]) }} className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-zinc-800">
                    {c.thumb ? (<img src={c.thumb} alt={c.name} className="h-4 w-4 rounded-full" />) : null}
                    <span className="text-xs">{c.name} ({c.symbol.toUpperCase()})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Moeda:</label>
          <select value={id} onChange={(e) => setId(e.target.value)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white">
            {topCoins.length > 0 ? (
              topCoins.slice(0, 12).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            ) : (
              <>
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="cardano">Cardano</option>
              </>
            )}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Base:</label>
          <select value={vs} onChange={(e) => setVs(e.target.value as any)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white">
            <option value="usd">USD</option>
            <option value="brl">BRL</option>
            <option value="eur">EUR</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Intervalo:</label>
          <select value={rangeDays} onChange={(e) => setRangeDays(Number(e.target.value) as any)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white">
            <option value={30}>30d</option>
            <option value={90}>90d</option>
            <option value={180}>180d</option>
            <option value={365}>365d</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showSMA7} onChange={(e) => setShowSMA7(e.target.checked)} />
            SMA 7
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showSMA30} onChange={(e) => setShowSMA30(e.target.checked)} />
            SMA 30
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showRSI} onChange={(e) => setShowRSI(e.target.checked)} />
            RSI 14
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showEMA12} onChange={(e) => setShowEMA12(e.target.checked)} />
            EMA 12
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showEMA26} onChange={(e) => setShowEMA26(e.target.checked)} />
            EMA 26
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={showMACD} onChange={(e) => setShowMACD(e.target.checked)} />
            MACD
          </label>
        </div>
      </div>

      <div className="mt-6 rounded border border-zinc-700 bg-zinc-900 p-4">
        {loading && <div className="text-xs text-zinc-500">Carregando dados…</div>}
        {error && <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">{error}</div>}
        {!error && chart.length > 0 && (
          <ChartOverlay
            base={chart}
            overlays={[
              ...(showSMA7 && sma7.length ? [{ points: sma7, color: '#22c55e' }] : []),
              ...(showSMA30 && sma30.length ? [{ points: sma30, color: '#f59e0b' }] : []),
              ...(showEMA12 && ema12.length ? [{ points: ema12, color: '#38bdf8' }] : []),
              ...(showEMA26 && ema26.length ? [{ points: ema26, color: '#a78bfa' }] : []),
            ]}
          />
        )}
        {showBB && bb20.upper.length > 0 && bb20.lower.length > 0 && (
          <ChartBands base={chart} upper={bb20.upper} lower={bb20.lower} />
        )}
      </div>

      {showRSI && rsi14.length > 0 && (
        <div className="mt-4 rounded border border-zinc-700 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400 mb-2">RSI 14 (faixas 30/70)</div>
          <ChartRSI points={rsi14} />
        </div>
      )}

      {showMACD && macdData.macd.length > 0 && macdData.signal.length > 0 && macdData.hist.length > 0 && (
        <div className="mt-4 rounded border border-zinc-700 bg-zinc-900 p-4">
          <div className="text-sm text-zinc-400 mb-2">MACD (12/26, sinal 9) e histograma</div>
          <ChartMACD macd={macdData.macd} signal={macdData.signal} hist={macdData.hist} />
        </div>
      )}

      {showStats && chart.length > 1 && (
        <StatsPanel stats={stats} />
      )}

      {/* Comparação de duas moedas com preço normalizado (100 no início) */}
      <div className="mt-6">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={compareEnabled} onChange={(e) => setCompareEnabled(e.target.checked)} />
            Comparar com outra moeda (preço normalizado)
          </label>
          {compareEnabled && (
            <>
              <select value={id2 ?? ''} onChange={(e) => setId2(e.target.value || null)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white">
                <option value="">Selecione</option>
                {topCoins.slice(0, 12).filter((c) => c.id !== id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="relative">
                <input value={searchQ2} onChange={(e) => setSearchQ2(e.target.value)} placeholder="Buscar moeda para comparar" className="w-48 rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white" />
                {searchQ2 && searchResults2.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-10 w-64 rounded border border-zinc-700 bg-zinc-900 p-2">
                    {searchResults2.map((c) => (
                      <button key={c.id} onClick={() => { setId2(c.id); setSearchQ2(''); setSearchResults2([]); setCompareEnabled(true) }} className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-zinc-800">
                        {c.thumb ? (<img src={c.thumb} alt={c.name} className="h-4 w-4 rounded-full" />) : null}
                        <span className="text-xs">{c.name} ({c.symbol.toUpperCase()})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {compareEnabled && id2 && chart.length > 1 && chart2.length > 1 && (() => {
          const { a, b } = alignByTimestamp(chart, chart2)
          const nA = normalize(a)
          const nB = normalize(b)
          return (
            <div className="mt-4 rounded border border-zinc-700 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400 mb-2">Comparação normalizada (base = 100)</div>
              <ChartCompareNormalized base={nA} other={nB} labelBase={`Base: ${id}`} labelOther={`Comparação: ${id2}`} />
            </div>
          )
        })()}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={showBB} onChange={(e) => setShowBB(e.target.checked)} />
          Bollinger Bands (20, 2σ)
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={showStats} onChange={(e) => setShowStats(e.target.checked)} />
          Estatísticas do período
        </label>
      </div>

      {/* Presets de indicadores: salvar/aplicar/copiar link */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Nome do preset"
          className="w-48 rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
        />
        <button onClick={savePreset} className="rounded border border-indigo-500/50 px-3 py-2 text-sm text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/10">
          Salvar preset
        </button>
        <select
          value={selectedPreset}
          onChange={(e) => { setSelectedPreset(e.target.value); if (e.target.value) applyPresetByName(e.target.value) }}
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
        >
          <option value="">Aplicar preset</option>
          {presets.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
        </select>
        <button onClick={copyLink} className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500">
          Copiar link
        </button>
      </div>

      {/* Conteúdo fundamental por moeda selecionada (layout similar ao Sandmark) */}
      <section className="analysis-flow prose prose-invert max-w-none mx-auto px-0 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(() => {
            const f = FUNDAMENTAL_TEXTS[id]
            const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            const author = 'Equipe Prime'
            function estimateReadingMinutesFromFundamental(ft?: { paragraphs: string[]; risks?: string[]; catalysts?: string[] }): number {
              if (!ft) return 2
              const textParts: string[] = []
              textParts.push(...(ft.paragraphs || []))
              if (ft.risks) textParts.push(...ft.risks)
              if (ft.catalysts) textParts.push(...ft.catalysts)
              const words = textParts.join(' ').trim().split(/\s+/).filter(Boolean).length
              return Math.max(2, Math.ceil(words / 220))
            }
            const readingMin = estimateReadingMinutesFromFundamental(f)
            const tags: string[] = [id.toUpperCase(), 'Fundamental', 'Catalisadores', 'Riscos']
            const allKeys = Object.keys(FUNDAMENTAL_TEXTS)
            return (
              <>
                <article className="md:col-span-2">
                  <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                    <span>Análises</span>
                    <span>•</span>
                    <span>Fundamental</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                  </div>
                  {f ? (
                    <>
                      <h1 className="!text-4xl !leading-tight !font-bold">{f.title}</h1>
                      {f.subtitle ? (<p className="!mt-2 !text-sm text-zinc-400">{f.subtitle}</p>) : null}
                      {/* Meta de autor e tempo de leitura */}
                      <div className="mt-3 text-xs text-zinc-400">
                        <span>Por {author}</span>
                        <span className="mx-2">•</span>
                        <span>{readingMin} min de leitura</span>
                      </div>
                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">{t}</span>
                        ))}
                      </div>
                      {f.paragraphs[0] ? (<p className="!mt-6 !text-base text-zinc-200">{f.paragraphs[0]}</p>) : null}
                      <hr className="my-6 border-zinc-800" />
                      {f.paragraphs.slice(1).map((p, i) => (<p key={i}>{p}</p>))}
                      {f.risks && f.risks.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-xl font-semibold">Riscos</h3>
                          <ul className="mt-2 list-disc pl-5">
                            {f.risks.map((p, i) => (<li key={`r-${i}`}>{p}</li>))}
                          </ul>
                        </div>
                      )}
                      {f.catalysts && f.catalysts.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-xl font-semibold">Catalisadores</h3>
                          <ul className="mt-2 list-disc pl-5">
                            {f.catalysts.map((p, i) => (<li key={`c-${i}`}>{p}</li>))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
                      Análise fundamentalista ainda não disponível para esta moeda.
                    </div>
                  )}
                  <div className="mt-8">
                    <a
                      href="#inicio"
                      className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
                      aria-label="Voltar para o início do site"
                    >
                      Voltar ao início
                    </a>
                  </div>
                </article>
                <aside className="md:col-span-1">
                  <div className="mt-4 rounded border border-zinc-700 bg-zinc-900 p-4">
                    <div className="text-sm font-semibold">Mais análises</div>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {allKeys.map((k) => (
                        <button key={k} onClick={() => setId(k)} className={`text-left rounded px-2 py-2 text-xs transition ${id === k ? 'bg-indigo-500/10 border border-indigo-500/40' : 'border border-zinc-700 hover:border-zinc-500'}`}>
                          {FUNDAMENTAL_TEXTS[k].title.replace('Análise fundamentalista: ', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </>
            )
          })()}
        </div>
      </section>
    </section>
  )
}