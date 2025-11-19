import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, X, TrendingUp, TrendingDown, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '../hooks/useStore';
import { useDataOptimization } from '../hooks/usePerformance';
import { ChartSkeleton } from './SkeletonLoader';

interface ComparisonCoin {
  id: string;
  symbol: string;
  name: string;
  color: string;
  data: Array<{ timestamp: number; price: number; date: string }>;
}

interface CoinComparisonChartProps {
  className?: string;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

const PRESET_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' }
];

export const CoinComparisonChart: React.FC<CoinComparisonChartProps> = ({ className = '' }) => {
  const { isDark: theme } = useTheme();
  
  const [selectedCoins, setSelectedCoins] = useState<ComparisonCoin[]>([]);
  const [availableCoins, setAvailableCoins] = useState(PRESET_COINS);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showPercentage, setShowPercentage] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addCoin = async (coinId: string) => {
    if (selectedCoins.find(coin => coin.id === coinId)) return;
    
    const coinData = PRESET_COINS.find(coin => coin.id === coinId);
    if (!coinData) return;

    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
      const data = await response.json();
      
      const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }));

      const basePrice = prices[0]?.price || 1;
      const normalizedData = prices.map((item: { timestamp: number; price: number; date: string }) => ({
        ...item,
        price: showPercentage ? ((item.price / basePrice - 1) * 100) : item.price
      }));

      const newCoin: ComparisonCoin = {
        id: coinId,
        symbol: coinData.symbol,
        name: coinData.name,
        color: COLORS[selectedCoins.length % COLORS.length],
        data: normalizedData
      };

      setSelectedCoins([...selectedCoins, newCoin]);
    } catch (error) {
      console.error('Erro ao buscar dados da moeda:', error);
    }
  };

  const removeCoin = (coinId: string) => {
    setSelectedCoins(selectedCoins.filter(coin => coin.id !== coinId));
  };

  const updateTimeRange = async (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
    
    // Recarregar dados para todas as moedas selecionadas
    const updatedCoins = await Promise.all(
      selectedCoins.map(async (coin) => {
        const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${days}`);
        const data = await response.json();
        
        const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price,
          date: new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }));

        const basePrice = prices[0]?.price || 1;
        const normalizedData = prices.map((item: { timestamp: number; price: number; date: string }) => ({
          ...item,
          price: showPercentage ? ((item.price / basePrice - 1) * 100) : item.price
        }));

        return { ...coin, data: normalizedData };
      })
    );
    
    setSelectedCoins(updatedCoins);
  };

  const togglePercentage = () => {
    const newShowPercentage = !showPercentage;
    setShowPercentage(newShowPercentage);
    
    // Recalcular dados
    const updatedCoins = selectedCoins.map(coin => {
      const basePrice = coin.data[0]?.price || 1;
      return {
        ...coin,
        data: coin.data.map(item => ({
          ...item,
          price: newShowPercentage ? ((item.price / basePrice - 1) * 100) : item.price
        }))
      };
    });
    
    setSelectedCoins(updatedCoins);
  };

  const prepareChartData = () => {
    if (selectedCoins.length === 0) return [];
    
    const timestamps = selectedCoins[0].data.map(item => item.timestamp);
    
    return timestamps.map((timestamp, index) => {
      const dataPoint: any = {
        date: selectedCoins[0].data[index].date,
        timestamp
      };
      
      selectedCoins.forEach(coin => {
        dataPoint[coin.symbol] = coin.data[index]?.price || 0;
      });
      
      return dataPoint;
    });
  };

  const chartData = prepareChartData();

  if (!isClient) {
    return <ChartSkeleton />;
  }

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            📈 Comparação entre Moedas
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Compare o desempenho de diferentes criptomoedas ao longo do tempo
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          <button
            onClick={togglePercentage}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPercentage 
                ? 'bg-indigo-600 text-white' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {showPercentage ? '%' : '$'}
          </button>
          
          <button
            onClick={() => setChartType(chartType === 'line' ? 'area' : 'line')}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controles de tempo */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
          <button
            key={range}
            onClick={() => updateTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : '1 ano'}
          </button>
        ))}
      </div>

      {/* Seletor de moedas */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Adicionar moeda para comparação:
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCoins.map((coin) => {
            const isSelected = selectedCoins.find(c => c.id === coin.id);
            return (
              <button
                key={coin.id}
                onClick={() => !isSelected && addCoin(coin.id)}
                disabled={!!isSelected}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {coin.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda das moedas selecionadas */}
      {selectedCoins.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Moedas selecionadas:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCoins.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: coin.color }}
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {coin.name} ({coin.symbol})
                </span>
                <button
                  onClick={() => removeCoin(coin.id)}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="h-96">
        {selectedCoins.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="w-16 h-16 mb-4 text-zinc-300 dark:text-zinc-600" />
            <p className="text-lg font-medium mb-2">Nenhuma moeda selecionada</p>
            <p className="text-sm text-center max-w-md">
              Adicione moedas clicando nos botões acima para começar a comparar seus desempenhos
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                  tickFormatter={(value) => 
                    showPercentage ? `${value.toFixed(1)}%` : `$${value.toLocaleString()}`
                  }
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${theme ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: theme ? '#F9FAFB' : '#111827'
                  }}
                  formatter={(value: any, name: string) => [
                    showPercentage ? `${value.toFixed(2)}%` : `$${value.toLocaleString()}`,
                    name
                  ]}
                />
                <Legend />
                {selectedCoins.map((coin) => (
                  <Line
                    key={coin.id}
                    type="monotone"
                    dataKey={coin.symbol}
                    stroke={coin.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                  tickFormatter={(value) => 
                    showPercentage ? `${value.toFixed(1)}%` : `$${value.toLocaleString()}`
                  }
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${theme ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: theme ? '#F9FAFB' : '#111827'
                  }}
                  formatter={(value: any, name: string) => [
                    showPercentage ? `${value.toFixed(2)}%` : `$${value.toLocaleString()}`,
                    name
                  ]}
                />
                <Legend />
                {selectedCoins.map((coin, index) => (
                  <Area
                    key={coin.id}
                    type="monotone"
                    dataKey={coin.symbol}
                    stroke={coin.color}
                    fill={coin.color}
                    fillOpacity={index === 0 ? 0.3 : 0.2}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Informações adicionais */}
      {selectedCoins.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCoins.map((coin) => {
            const firstPrice = coin.data[0]?.price || 0;
            const lastPrice = coin.data[coin.data.length - 1]?.price || 0;
            const change = lastPrice - firstPrice;
            const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;
            
            return (
              <div key={coin.id} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: coin.color }}
                    />
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {coin.name}
                    </span>
                  </div>
                  {changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <p>Período: {timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : timeRange === '90d' ? '90 dias' : '1 ano'}</p>
                  <p className={`font-medium ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Variação: {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};