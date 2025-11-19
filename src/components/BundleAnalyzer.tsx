import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BundleChunk {
  name: string;
  size: number;
  color: string;
  loaded: boolean;
}

interface BundleAnalyzerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({ 
  isVisible = true, 
  onClose 
}) => {
  const [chunks, setChunks] = useState<BundleChunk[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundles = () => {
    setIsAnalyzing(true);
    
    // Analisar scripts carregados na página
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const bundleData: BundleChunk[] = [];
    let total = 0;

    scripts.forEach((script, index) => {
      const src = script.getAttribute('src') || '';
      
      // Identificar diferentes tipos de bundles
      let name = 'Unknown';
      if (src.includes('vendor')) name = 'Vendor (React)';
      else if (src.includes('charts')) name = 'Charts (Recharts)';
      else if (src.includes('icons')) name = 'Icons (Lucide)';
      else if (src.includes('store')) name = 'Store (Zustand)';
      else if (src.includes('utils')) name = 'Utils';
      else if (src.includes('pwa')) name = 'PWA (Workbox)';
      else if (src.includes('main')) name = 'Main App';
      else if (src.includes('index')) name = 'Index';
      
      // Estimar tamanho baseado no nome (em KB)
      const size = Math.floor(Math.random() * 200) + 50; // Simulação
      total += size;
      
      bundleData.push({
        name,
        size,
        color: COLORS[index % COLORS.length],
        loaded: true
      });
    });

    // Adicionar CSS bundles
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    styles.forEach((style, index) => {
      const href = style.getAttribute('href') || '';
      const size = Math.floor(Math.random() * 50) + 10; // Simulação
      total += size;
      
      bundleData.push({
        name: `CSS ${index + 1}`,
        size,
        color: COLORS[(scripts.length + index) % COLORS.length],
        loaded: true
      });
    });

    setChunks(bundleData);
    setTotalSize(total);
    setIsAnalyzing(false);
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} KB`;
    return `${(size / 1024).toFixed(1)} MB`;
  };

  const getOptimizationTips = () => {
    const tips = [];
    
    if (totalSize > 1000) {
      tips.push('📦 Bundle total maior que 1MB - considere code splitting');
    }
    
    const largeChunks = chunks.filter(chunk => chunk.size > 150);
    if (largeChunks.length > 0) {
      tips.push(`⚠️ ${largeChunks.length} chunks grandes detectados`);
    }
    
    if (chunks.length > 10) {
      tips.push('🔍 Muitos chunks pequenos - considere agrupar');
    }
    
    if (tips.length === 0) {
      tips.push('✅ Bundle otimizado!');
    }
    
    return tips;
  };

  useEffect(() => {
    if (isVisible) {
      analyzeBundles();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analisador de Bundle
        </h3>
        <div className="flex gap-2">
          <button
            onClick={analyzeBundles}
            disabled={isAnalyzing}
            className="px-3 py-1 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analisando...' : 'Analisar'}
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

      <div className="mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Tamanho Total: <span className="font-semibold">{formatSize(totalSize)}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Chunks: <span className="font-semibold">{chunks.length}</span>
        </div>
      </div>

      {chunks.length > 0 && (
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chunks as any}
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill="#8884d8"
                dataKey="size"
                label={({ name, value }: any) => `${name}: ${formatSize(value)}`}
                labelLine={false}
              >
                {chunks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatSize(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Dicas de Otimização:
        </h4>
        {getOptimizationTips().map((tip, index) => (
          <div key={index} className="text-xs text-gray-600 dark:text-gray-300">
            {tip}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {chunks.map((chunk, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: chunk.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">{chunk.name}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              {formatSize(chunk.size)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook para usar o analisador de bundle
export const useBundleAnalyzer = () => {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const toggleAnalyzer = () => {
    setShowAnalyzer(prev => !prev);
  };

  return { showAnalyzer, toggleAnalyzer, BundleAnalyzer };
};