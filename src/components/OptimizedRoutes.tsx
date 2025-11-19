import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CardSkeleton, ChartSkeleton, ListSkeleton } from './SkeletonLoader';

// Lazy loading das páginas principais
const Home = lazy(() => import('../pages/Home').then(module => ({ default: module.default })));
const MarketSimple = lazy(() => import('../pages/MarketSimple').then(module => ({ default: module.default })));
const Noticias = lazy(() => import('../pages/Noticias').then(module => ({ default: module.default })));
const Analises = lazy(() => import('../pages/Analises').then(module => ({ default: module.default })));
const Contato = lazy(() => import('../pages/Contato').then(module => ({ default: module.default })));
const MoedaDetalhe = lazy(() => import('../pages/MoedaDetalhe').then(module => ({ default: module.default })));
const NoticiaDetalhe = lazy(() => import('../pages/NoticiaDetalhe').then(module => ({ default: module.default })));

// Componente de loading para rotas
const RouteLoading: React.FC<{ pageName: string }> = ({ pageName }) => (
  <div className="min-h-screen bg-zinc-950 p-6">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
      </div>
      
      {pageName === 'market' && <ListSkeleton items={6} />}
      {pageName === 'home' && <CardSkeleton />}
      {pageName === 'noticias' && <ListSkeleton items={4} />}
      {pageName === 'analises' && <ChartSkeleton />}
      {!['market', 'home', 'noticias', 'analises'].includes(pageName) && <CardSkeleton />}
    </div>
  </div>
);

// Componente de rotas otimizadas
export const OptimizedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Suspense fallback={<RouteLoading pageName="home" />}>
            <Home />
          </Suspense>
        } 
      />
      
      <Route 
        path="/market" 
        element={
          <Suspense fallback={<RouteLoading pageName="market" />}>
            <MarketSimple />
          </Suspense>
        } 
      />
      
      <Route 
        path="/noticias" 
        element={
          <Suspense fallback={<RouteLoading pageName="noticias" />}>
            <Noticias />
          </Suspense>
        } 
      />
      
      <Route 
        path="/analises" 
        element={
          <Suspense fallback={<RouteLoading pageName="analises" />}>
            <Analises />
          </Suspense>
        } 
      />
      
      <Route 
        path="/contato" 
        element={
          <Suspense fallback={<RouteLoading pageName="contato" />}>
            <Contato />
          </Suspense>
        } 
      />
      
      <Route 
        path="/moeda/:id" 
        element={
          <Suspense fallback={<RouteLoading pageName="moeda" />}>
            <MoedaDetalhe />
          </Suspense>
        } 
      />
      
      <Route 
        path="/noticia/:id" 
        element={
          <Suspense fallback={<RouteLoading pageName="noticia" />}>
            <NoticiaDetalhe />
          </Suspense>
        } 
      />
    </Routes>
  );
};

// Componente para pré-carregar rotas críticas
export const PreloadCriticalRoutes: React.FC = () => {
  React.useEffect(() => {
    // Pré-carregar rotas mais importantes
    const preloadRoutes = async () => {
      try {
        await Promise.all([
          import('../pages/Home'),
          import('../pages/MarketSimple'),
          import('../pages/Noticias')
        ]);
        console.log('Rotas críticas pré-carregadas');
      } catch (error) {
        console.warn('Erro ao pré-carregar rotas:', error);
      }
    };

    // Usar requestIdleCallback para não bloquear o main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadRoutes());
    } else {
      setTimeout(preloadRoutes, 1000);
    }
  }, []);

  return null;
};

// Hook para pré-carregar rotas manualmente
export const usePreloadRoute = () => {
  const preloadRoute = React.useCallback(async (route: string) => {
    try {
      switch (route) {
        case '/':
          await import('../pages/Home');
          break;
        case '/market':
          await import('../pages/MarketSimple');
          break;
        case '/noticias':
          await import('../pages/Noticias');
          break;
        case '/analises':
          await import('../pages/Analises');
          break;
        case '/contato':
          await import('../pages/Contato');
          break;
        default:
          console.warn('Rota desconhecida para pré-carregamento:', route);
      }
      console.log(`Rota ${route} pré-carregada`);
    } catch (error) {
      console.warn(`Erro ao pré-carregar rota ${route}:`, error);
    }
  }, []);

  return { preloadRoute };
};