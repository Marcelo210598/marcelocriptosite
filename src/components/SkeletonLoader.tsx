import React, { Suspense, lazy } from 'react';

// Skeleton loaders para diferentes tipos de conteúdo
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </div>
    <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
    <div className="mt-4 flex justify-between">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="w-16 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ 
  rows = 8, 
  cols = 5, 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {Array.from({ length: cols }).map((_, index) => (
              <th key={index} className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="animate-pulse">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className={`h-4 bg-gray-300 dark:bg-gray-700 rounded ${
                    colIndex === 0 ? 'w-16' : colIndex === cols - 1 ? 'w-12' : 'w-full'
                  }`}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const MarketSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const NewsCarouselSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="mt-3 flex justify-between items-center">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CoinListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 10, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Wrapper para lazy loading de componentes
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonType?: 'card' | 'chart' | 'list' | 'table';
  skeletonProps?: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback,
  skeletonType = 'card',
  skeletonProps = {}
}) => {
  const getSkeleton = () => {
    if (fallback) return fallback;
    
    switch (skeletonType) {
      case 'chart':
        return <ChartSkeleton {...skeletonProps} />;
      case 'list':
        return <ListSkeleton {...skeletonProps} />;
      case 'table':
        return <TableSkeleton {...skeletonProps} />;
      case 'card':
      default:
        return <CardSkeleton {...skeletonProps} />;
    }
  };

  return (
    <Suspense fallback={getSkeleton()}>
      {children}
    </Suspense>
  );
};

// Hook para detectar quando um componente está visível
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting };
};

// Componente que só renderiza quando visível
export const LazyLoadComponent: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}> = ({ children, placeholder = null, threshold = 0.1, rootMargin = '50px' }) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  return (
    <div ref={ref}>
      {isIntersecting ? children : placeholder}
    </div>
  );
};