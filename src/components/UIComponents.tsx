import React from 'react'
import { Moon, Sun, TrendingUp, TrendingDown, Bell, BellOff } from 'lucide-react'
import { useTheme, useNotifications } from '../hooks/useStore'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        rounded-lg p-2 transition-all duration-200 hover:scale-110
        ${isDark 
          ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700' 
          : 'bg-white text-zinc-700 hover:bg-zinc-100'
        }
        ${className}
      `}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}

export const NotificationToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { notifications, clearNotifications } = useNotifications()
  const hasNotifications = notifications.length > 0
  
  return (
    <button
      onClick={hasNotifications ? clearNotifications : undefined}
      className={`
        relative rounded-lg p-2 transition-all duration-200
        ${hasNotifications 
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
          : 'text-zinc-400 hover:text-zinc-300'
        }
        ${className}
      `}
      aria-label={hasNotifications ? 'Limpar notificações' : 'Sem notificações'}
    >
      {hasNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
          {notifications.length}
        </span>
      )}
    </button>
  )
}

export const PriceChangeBadge: React.FC<{ 
  change: number 
  className?: string 
}> = ({ change, className = '' }) => {
  const isPositive = change > 0
  const isNegative = change < 0
  
  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
      ${isPositive ? 'bg-green-500/10 text-green-400' : ''}
      ${isNegative ? 'bg-red-500/10 text-red-400' : ''}
      ${!isPositive && !isNegative ? 'bg-zinc-500/10 text-zinc-400' : ''}
      ${className}
    `}>
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {change.toFixed(2)}%
    </span>
  )
}