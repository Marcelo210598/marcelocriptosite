import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ResourcePreloaderProps {
  resources?: string[];
  onComplete?: () => void;
}

// Recursos críticos padrão para pré-carregar
const DEFAULT_RESOURCES = [
  '/src/components/MobileDashboard.tsx',
  '/src/components/OptimizedImage.tsx',
  '/src/components/SkeletonLoader.tsx',
  '/src/hooks/usePerformance.tsx',
  '/src/utils/cache.ts'
];

export const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({ 
  resources = DEFAULT_RESOURCES,
  onComplete 
}) => {
  const [preloadStatus, setPreloadStatus] = React.useState<Record<string, boolean>>({});
  const [isPreloading, setIsPreloading] = React.useState(false);

  const preloadResource = async (url: string): Promise<void> => {
    try {
      // Pré-carregar diferentes tipos de recursos
      if (url.endsWith('.js') || url.endsWith('.ts') || url.endsWith('.tsx')) {
        // Pré-carregar módulos JavaScript
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = url;
        document.head.appendChild(link);
      } else if (url.endsWith('.css')) {
        // Pré-carregar CSS
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = 'style';
        document.head.appendChild(link);
      } else if (url.match(/\.(png|jpg|jpeg|webp|svg|gif)$/)) {
        // Pré-carregar imagens
        const img = new Image();
        img.src = url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      } else if (url.match(/\.(woff|woff2|ttf|eot)$/)) {
        // Pré-carregar fontes
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
      
      setPreloadStatus(prev => ({ ...prev, [url]: true }));
    } catch (error) {
      console.warn(`Falha ao pré-carregar recurso: ${url}`, error);
      setPreloadStatus(prev => ({ ...prev, [url]: false }));
    }
  };

  const preloadAllResources = async () => {
    setIsPreloading(true);
    
    // Pré-carregar recursos em paralelo com limite de concorrência
    const concurrencyLimit = 5;
    const chunks = [];
    
    for (let i = 0; i < resources.length; i += concurrencyLimit) {
      chunks.push(resources.slice(i, i + concurrencyLimit));
    }
    
    for (const chunk of chunks) {
      await Promise.allSettled(chunk.map(preloadResource));
    }
    
    setIsPreloading(false);
    onComplete?.();
  };

  useEffect(() => {
    // Pré-carregar recursos automaticamente após um delay
    const timer = setTimeout(() => {
      preloadAllResources();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const completedCount = Object.values(preloadStatus).filter(Boolean).length;
  const progress = resources.length > 0 ? (completedCount / resources.length) * 100 : 0;

  return (
    <div className="fixed bottom-20 right-6 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Pré-carregando Recursos
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {completedCount}/{resources.length}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-300">
        {isPreloading ? 'Carregando...' : progress === 100 ? 'Concluído!' : 'Aguardando...'}
      </div>
      
      {Object.keys(preloadStatus).length > 0 && (
        <div className="mt-2 max-h-20 overflow-y-auto">
          {Object.entries(preloadStatus).map(([url, loaded]) => (
            <div key={url} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                loaded ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-600 dark:text-gray-300 truncate">
                {url.split('/').pop()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Hook para pré-carregar recursos específicos
export const useResourcePreloader = (resources?: string[]) => {
  const [isPreloaded, setIsPreloaded] = React.useState(false);

  const preload = async () => {
    const resourcesToPreload = resources || DEFAULT_RESOURCES;
    
    // Pré-carregar em paralelo
    const promises = resourcesToPreload.map(async (url) => {
      try {
        if (url.endsWith('.js') || url.endsWith('.ts') || url.endsWith('.tsx')) {
          const link = document.createElement('link');
          link.rel = 'modulepreload';
          link.href = url;
          document.head.appendChild(link);
        } else if (url.endsWith('.css')) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = url;
          link.as = 'style';
          document.head.appendChild(link);
        }
      } catch (error) {
        console.warn(`Falha ao pré-carregar: ${url}`, error);
      }
    });

    await Promise.allSettled(promises);
    setIsPreloaded(true);
  };

  return { preload, isPreloaded };
};

// Componente de pré-carregamento inteligente baseado na rota
export const SmartResourcePreloader: React.FC = () => {
  const location = useLocation();
  const [resources, setResources] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Definir recursos baseados na rota atual
    let routeResources: string[] = [];
    
    switch (location.pathname) {
      case '/':
        routeResources = [
          '/src/components/MobileDashboard.tsx',
          '/src/components/OptimizedImage.tsx',
          '/src/components/SkeletonLoader.tsx'
        ];
        break;
      case '/market':
        routeResources = [
          '/src/pages/MarketSimple.tsx',
          '/src/components/OptimizedImage.tsx',
          '/src/hooks/usePerformance.tsx'
        ];
        break;
      case '/noticias':
        routeResources = [
          '/src/pages/Noticias.tsx',
          '/src/components/SkeletonLoader.tsx'
        ];
        break;
      default:
        routeResources = DEFAULT_RESOURCES;
    }
    
    setResources(routeResources);
  }, [location.pathname]);

  return <ResourcePreloader resources={resources} />;
};