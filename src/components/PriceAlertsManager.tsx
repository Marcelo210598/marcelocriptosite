import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/useStore';
import { ChartSkeleton } from './SkeletonLoader';

interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  currentPrice: number;
  alertType: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  notificationSent: boolean;
}

interface PriceAlertsManagerProps {
  className?: string;
}

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

export const PriceAlertsManager: React.FC<PriceAlertsManagerProps> = ({ className = '' }) => {
  const { isDark: theme } = useTheme();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Form state
  const [selectedCoin, setSelectedCoin] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    setIsClient(true);
    loadAlerts();
    fetchCurrentPrices();
    
    // Verificar alertas a cada 30 segundos
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    try {
      const savedAlerts = localStorage.getItem('priceAlerts');
      if (savedAlerts) {
        const parsedAlerts = JSON.parse(savedAlerts).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
        }));
        setAlerts(parsedAlerts);
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    try {
      localStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Erro ao salvar alertas:', error);
    }
  };

  const fetchCurrentPrices = async () => {
    try {
      const coinIds = PRESET_COINS.map(coin => coin.id).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      );
      const data = await response.json();
      
      const prices: Record<string, number> = {};
      PRESET_COINS.forEach(coin => {
        prices[coin.id] = data[coin.id]?.usd || 0;
      });
      
      setCurrentPrices(prices);
    } catch (error) {
      console.error('Erro ao buscar preços atuais:', error);
    }
  };

  const checkAlerts = async () => {
    if (alerts.length === 0) return;
    
    try {
      const coinIds = alerts.map(alert => alert.coinId).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      );
      const data = await response.json();
      
      const updatedAlerts = alerts.map(alert => {
        const currentPrice = data[alert.coinId]?.usd || alert.currentPrice;
        const shouldTrigger = 
          (alert.alertType === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.alertType === 'below' && currentPrice <= alert.targetPrice);
        
        if (shouldTrigger && alert.isActive && !alert.notificationSent) {
          // Enviar notificação
          sendPriceAlertNotification(alert, currentPrice);
          
          return {
            ...alert,
            currentPrice,
            notificationSent: true,
            triggeredAt: new Date(),
            isActive: false // Desativar após disparar
          };
        }
        
        return {
          ...alert,
          currentPrice
        };
      });
      
      saveAlerts(updatedAlerts);
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    }
  };

  const sendPriceAlertNotification = (alert: PriceAlert, currentPrice: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = `Alerta de Preço: ${alert.coinName}`;
      const body = `O preço de ${alert.coinSymbol} atingiu ${currentPrice >= alert.targetPrice ? 'acima de' : 'abaixo de'} $${alert.targetPrice.toLocaleString()}. Preço atual: $${currentPrice.toLocaleString()}`;
      
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: `price-alert-${alert.id}`,
        requireInteraction: true
      } as NotificationOptions);
    }
  };

  const addAlert = async () => {
    if (!selectedCoin || !targetPrice) return;
    
    setLoading(true);
    
    try {
      const coinData = PRESET_COINS.find(coin => coin.id === selectedCoin);
      if (!coinData) return;
      
      const currentPrice = currentPrices[selectedCoin] || 0;
      
      const newAlert: PriceAlert = {
        id: Date.now().toString(),
        coinId: selectedCoin,
        coinName: coinData.name,
        coinSymbol: coinData.symbol,
        targetPrice: parseFloat(targetPrice),
        currentPrice,
        alertType,
        isActive: true,
        createdAt: new Date(),
        notificationSent: false
      };
      
      const updatedAlerts = [...alerts, newAlert];
      saveAlerts(updatedAlerts);
      
      // Limpar formulário
      setSelectedCoin('');
      setTargetPrice('');
      setAlertType('above');
      setShowForm(false);
      
    } catch (error) {
      console.error('Erro ao adicionar alerta:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    saveAlerts(updatedAlerts);
  };

  const toggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    );
    saveAlerts(updatedAlerts);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  if (!isClient) {
    return <ChartSkeleton />;
  }

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            🔔 Alertas de Preço
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Configure alertas personalizados para suas criptomoedas favoritas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Ativar notificações"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Alerta
          </button>
        </div>
      </div>

      {/* Formulário de novo alerta */}
      {showForm && (
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Criar Novo Alerta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Moeda
              </label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              >
                <option value="">Selecione uma moeda</option>
                {PRESET_COINS.map(coin => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Preço Alvo (USD)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tipo de Alerta
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              >
                <option value="above">Quando o preço subir acima</option>
                <option value="below">Quando o preço cair abaixo</option>
              </select>
            </div>
          </div>
          
          {selectedCoin && currentPrices[selectedCoin] && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">
                  Preço atual: ${currentPrices[selectedCoin].toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <button
              onClick={addAlert}
              disabled={!selectedCoin || !targetPrice || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Alerta'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de alertas */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
            <p className="text-lg font-medium mb-2">Nenhum alerta configurado</p>
            <p className="text-sm">Crie seu primeiro alerta de preço clicando no botão "Novo Alerta"</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all ${
                alert.isActive
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    alert.isActive ? 'bg-green-500' : 'bg-zinc-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-white">
                      {alert.coinName} ({alert.coinSymbol})
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {alert.alertType === 'above' ? 'Subir acima de' : 'Cair abaixo de'} ${alert.targetPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      Preço atual: ${alert.currentPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {alert.notificationSent && (
                    <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded">
                      Disparado
                    </span>
                  )}
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      alert.isActive
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                    }`}
                  >
                    {alert.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {alert.triggeredAt && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Disparado em: {alert.triggeredAt.toLocaleDateString('pt-BR')} às {alert.triggeredAt.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};