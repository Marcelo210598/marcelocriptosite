import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, TrendingUp, Newspaper, BarChart3, Mail, Home } from 'lucide-react'
import { useTheme } from '../hooks/useStore'

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isDark } = useTheme()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/noticias', label: 'Notícias', icon: Newspaper },
    { to: '/analises', label: 'Análises', icon: BarChart3 },
    { to: '/market', label: 'Moedas', icon: TrendingUp },
    { to: '/contato', label: 'Contato', icon: Mail },
  ]

  return (
    <>
      {/* Botão do menu hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-zinc-800/50"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-zinc-300" />
        ) : (
          <Menu className="w-6 h-6 text-zinc-300" />
        )}
      </button>

      {/* Overlay do menu */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu lateral */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-sm z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDark
            ? 'bg-zinc-900 border-l border-zinc-800'
            : 'bg-white border-l border-zinc-200'
        }`}
      >
        {/* Header do menu */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-zinc-800/50"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-zinc-300" />
          </button>
        </div>

        {/* Itens do menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 hover:bg-zinc-800/50 active:bg-zinc-800/70"
                  >
                    <Icon className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-200 font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer do menu com informações adicionais */}
        <div className="p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 text-center">
            <p>Marcelo Cripto</p>
            <p className="mt-1">Seu portal de criptomoedas</p>
          </div>
        </div>
      </div>
    </>
  )
}