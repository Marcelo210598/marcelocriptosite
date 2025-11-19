import React, { useEffect, useState } from 'react'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Noticias from './pages/Noticias'
import Analises from './pages/Analises'
import Contato from './pages/Contato'
import Market from './pages/MarketSimple'
import MoedaDetalhe from './pages/MoedaDetalhe'
import NoticiaDetalhe from './pages/NoticiaDetalhe'
import { NotificationContainer } from './components/NotificationContainer'
import { ThemeToggle, NotificationToggle } from './components/UIComponents'
import { useTheme } from './hooks/useStore'
import { EnhancedFooter } from './components/EnhancedFooter'
import { ScrollProgress } from './components/ScrollEffects'
import { ParticleBackground } from './components/ParticleBackground'
import { MobileMenu } from './components/MobileMenu'
import { QuickActionsMobile } from './components/QuickActionsMobile'
import { MobileDashboard } from './components/MobileDashboard'
import { ServiceWorkerRegister } from './components/ServiceWorkerRegister'
import { usePerformanceMonitor } from './components/PerformanceMonitor'
import { useBundleAnalyzer } from './components/BundleAnalyzer'
import { SmartResourcePreloader } from './components/ResourcePreloader'
import { SmartSearch, useSmartSearch } from './components/SmartSearch'
import { useAutoTheme } from './hooks/useAutoTheme'
import { useGestures, PullToRefreshIndicator } from './hooks/useGestures'
import { useCache } from './utils/cache'

export default function App(): React.JSX.Element {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMobileDashboard, setShowMobileDashboard] = useState(false)
  const { showMonitor, toggleMonitor, PerformanceMonitor } = usePerformanceMonitor()
  const { showAnalyzer, toggleAnalyzer, BundleAnalyzer } = useBundleAnalyzer()
  const { isSearchOpen, openSearch, closeSearch, handleResultSelect } = useSmartSearch()
  
  // Initialize auto theme
  useAutoTheme()
  
  // Initialize cache
  const { refreshCache } = useCache()
  
  // Configure touch gestures
  const { gestureState } = useGestures({
    onSwipeLeft: () => {
      // Swipe para próxima aba
      const routes = ['/', '/noticias', '/analises', '/market', '/contato']
      const currentIndex = routes.indexOf(location.pathname)
      if (currentIndex < routes.length - 1) {
        navigate(routes[currentIndex + 1])
      }
    },
    onSwipeRight: () => {
      // Swipe para aba anterior
      const routes = ['/', '/noticias', '/analises', '/market', '/contato']
      const currentIndex = routes.indexOf(location.pathname)
      if (currentIndex > 0) {
        navigate(routes[currentIndex - 1])
      }
    },
    onPullToRefresh: () => {
      // Refresh data when pulling
      refreshCache()
      window.location.reload()
    }
  })
  
  // Check for mobile dashboard on home
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setShowMobileDashboard(isMobile && location.pathname === '/')
  }, [location.pathname])
  
  return (
    <main id="inicio" className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-zinc-950' : 'bg-white text-zinc-900'}`}>
      {/* Background de partículas */}
      <ParticleBackground particleCount={30} />
      
      {/* Barra de progresso do scroll */}
      <ScrollProgress />
      
      {/* Cabeçalho com navegação */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Marcelo Cripto</Link>
          
          {/* Navegação desktop */}
          <nav className="hidden lg:flex items-center gap-4">
            <div className="flex gap-5 text-sm text-zinc-300">
              <Link to="/noticias" className="hover:text-white transition-colors">Notícias</Link>
              <Link to="/analises" className="hover:text-white transition-colors">Análises</Link>
              <Link to="/market" className="hover:text-white transition-colors">Moedas</Link>
              <Link to="/contato" className="hover:text-white transition-colors">Contato</Link>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-zinc-700">
              <button
                onClick={openSearch}
                className="text-zinc-300 hover:text-white transition-colors text-sm"
                title="Busca Inteligente"
              >
                🔍
              </button>
              <button
                onClick={toggleMonitor}
                className="text-zinc-300 hover:text-white transition-colors text-sm"
                title="Monitor de Performance"
              >
                📊
              </button>
              <button
                onClick={toggleAnalyzer}
                className="text-zinc-300 hover:text-white transition-colors text-sm"
                title="Analisador de Bundle"
              >
                📦
              </button>
              <NotificationToggle />
              <ThemeToggle />
            </div>
          </nav>

          {/* Menu mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={openSearch}
              className="text-zinc-300 hover:text-white transition-colors text-sm"
              title="Busca Inteligente"
            >
              🔍
            </button>
            <button
              onClick={toggleMonitor}
              className="text-zinc-300 hover:text-white transition-colors text-sm"
              title="Monitor de Performance"
            >
              📊
            </button>
            <button
              onClick={toggleAnalyzer}
              className="text-zinc-300 hover:text-white transition-colors text-sm"
              title="Analisador de Bundle"
            >
              📦
            </button>
            <NotificationToggle />
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Conteúdo por rotas */}
      <Routes>
        <Route path="/" element={showMobileDashboard ? <MobileDashboard /> : <Home />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticia/:id" element={<NoticiaDetalhe />} />
        <Route path="/analises" element={<Analises />} />
        <Route path="/market" element={<Market />} />
        <Route path="/moeda/:id" element={<MoedaDetalhe />} />
        <Route path="/contato" element={<Contato />} />
      </Routes>

      {/* Rodapé */}
      <EnhancedFooter />

      {/* Botão flutuante para voltar ao início */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/"
          className="rounded-full border border-indigo-500/50 bg-zinc-900/70 px-3 py-2 text-xs sm:text-sm font-medium text-indigo-200 shadow-lg backdrop-blur-sm hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all duration-200"
          aria-label="Voltar para o início do site"
        >
          Voltar ao início
        </Link>
      </div>

      {/* Container de notificações */}
      <NotificationContainer />

      {/* Ações rápidas para mobile */}
      <QuickActionsMobile />

      {/* Notificações push - componente integrado no header */}

      {/* Indicador de pull-to-refresh */}
      <PullToRefreshIndicator gestureState={gestureState} />
      
      {/* Registrar Service Worker */}
      <ServiceWorkerRegister />
      
      {/* Pré-carregador Inteligente de Recursos */}
      <SmartResourcePreloader />
      
      {/* Monitor de Performance */}
      <PerformanceMonitor 
        isVisible={showMonitor} 
        onClose={toggleMonitor}
      />
      
      {/* Analisador de Bundle */}
      <BundleAnalyzer 
        isVisible={showAnalyzer} 
        onClose={toggleAnalyzer}
      />
      
      {/* Busca Inteligente */}
      <SmartSearch 
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onResultSelect={handleResultSelect}
      />
    </main>
  )
}