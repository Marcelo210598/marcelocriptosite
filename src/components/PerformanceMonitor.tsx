import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceMetrics {
  timestamp: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  isVisible = true, 
  onClose 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);

  const collectMetrics = (): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    const renderTime = navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0;
    
    const memory = (performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // MB
    
    const networkRequests = performance.getEntriesByType('resource').length;

    return {
      timestamp: Date.now(),
      loadTime: Math.max(0, loadTime),
      renderTime: Math.max(0, renderTime),
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      networkRequests,
    };
  };

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newMetrics = collectMetrics();
      setCurrentMetrics(newMetrics);
      setMetrics(prev => {
        const updated = [...prev, newMetrics];
        return updated.slice(-20); // Manter últimos 20 pontos
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    const initialMetrics = collectMetrics();
    setCurrentMetrics(initialMetrics);
    setMetrics([initialMetrics]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const clearMetrics = () => {
    setMetrics([]);
    setCurrentMetrics(null);
  };

  const exportMetrics = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Monitor de Performance
        </h3>
        <div className="flex gap-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isMonitoring 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isMonitoring ? 'Parar' : 'Iniciar'}
          </button>
          <button
            onClick={clearMetrics}
            className="px-3 py-1 rounded text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white"
          >
            Limpar
          </button>
          <button
            onClick={exportMetrics}
            disabled={metrics.length === 0}
            className="px-3 py-1 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Exportar
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded text-sm font-medium bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {currentMetrics && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-300">Tempo de Carregamento</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMetrics.loadTime}ms
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-300">Tempo de Renderização</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMetrics.renderTime}ms
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-300">Uso de Memória</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMetrics.memoryUsage}MB
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-300">Requisições de Rede</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMetrics.networkRequests}
            </div>
          </div>
        </div>
      )}

      {metrics.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip 
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                formatter={(value, name) => [
                  `${value}${String(name).includes('Time') ? 'ms' : String(name).includes('Memory') ? 'MB' : ''}`,
                  name
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="loadTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Tempo de Carregamento"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="renderTime" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Tempo de Renderização"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="memoryUsage" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Uso de Memória"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isMonitoring && metrics.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Inicie o monitoramento para ver as métricas de performance</p>
        </div>
      )}
    </div>
  );
};

// Hook para usar o monitor de performance
export const usePerformanceMonitor = () => {
  const [showMonitor, setShowMonitor] = useState(false);

  const toggleMonitor = () => {
    setShowMonitor(prev => !prev);
  };

  return { showMonitor, toggleMonitor, PerformanceMonitor };
};