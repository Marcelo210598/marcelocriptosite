import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, Star, X } from 'lucide-react'
import { useFavorites } from '../hooks/useStore'
import { showNotification } from '../utils/notifications'

export const MobileQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { favorites } = useFavorites()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const actions = [
    {
      id: 'favorites',
      icon: Star,
      label: 'Favoritos',
      href: '#favorites',
      badge: favorites.length > 0 ? favorites.length : null,
      onClick: () => {
        const favoritesSection = document.getElementById('favorites-section')
        if (favoritesSection) {
          favoritesSection.scrollIntoView({ behavior: 'smooth' })
          showNotification('Abrindo favoritos', 'info')
        } else {
          showNotification('Nenhuma moeda favorita ainda', 'info')
        }
      }
    },
    {
      id: 'market',
      icon: TrendingUp,
      label: 'Mercado',
      href: '/market',
      onClick: () => {
        window.location.href = '/market'
      }
    }
  ]

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40">
      {/* Botões de ação rápida */}
      <div className={`flex flex-col gap-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="relative p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full shadow-lg text-white transition-all duration-200 active:scale-95"
              aria-label={action.label}
            >
              <Icon className="w-5 h-5" />
              {action.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {action.badge > 9 ? '9+' : action.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Botão principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full shadow-lg text-white transition-all duration-300 active:scale-95 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label="Abrir ações rápidas"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>
    </div>
  )
}