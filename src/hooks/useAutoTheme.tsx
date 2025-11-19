import { useState, useEffect } from 'react'
import { useTheme } from './useStore'

interface AutoThemeOptions {
  enableSystemPreference: boolean
  enableTimeBased: boolean
  darkModeStart: number // 0-23
  darkModeEnd: number // 0-23
}

export const useAutoTheme = (options: AutoThemeOptions = {
  enableSystemPreference: true,
  enableTimeBased: false,
  darkModeStart: 20, // 8 PM
  darkModeEnd: 6, // 6 AM
}) => {
  const { isDark, toggleTheme } = useTheme()
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(null)
  const [currentTimeTheme, setCurrentTimeTheme] = useState<'light' | 'dark'>('light')

  // Detectar preferência do sistema
  useEffect(() => {
    if (!options.enableSystemPreference) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }

    // Configurar listener inicial
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light')
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback para browsers antigos
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [options.enableSystemPreference])

  // Detectar tema baseado no horário
  useEffect(() => {
    if (!options.enableTimeBased) return

    const checkTimeTheme = () => {
      const now = new Date()
      const currentHour = now.getHours()
      
      // Verificar se está no período noturno
      let isDarkTime: boolean
      
      if (options.darkModeStart > options.darkModeEnd) {
        // Período que cruza a meia-noite (ex: 20h às 6h)
        isDarkTime = currentHour >= options.darkModeStart || currentHour < options.darkModeEnd
      } else {
        // Período normal (ex: 20h às 6h do dia seguinte)
        isDarkTime = currentHour >= options.darkModeStart && currentHour < options.darkModeEnd
      }
      
      setCurrentTimeTheme(isDarkTime ? 'dark' : 'light')
    }

    checkTimeTheme()
    
    // Verificar a cada minuto
    const interval = setInterval(checkTimeTheme, 60000)
    
    return () => clearInterval(interval)
  }, [options.enableTimeBased, options.darkModeStart, options.darkModeEnd])

  // Aplicar tema automático
  useEffect(() => {
    let targetTheme: 'light' | 'dark'
    
    // Prioridade: Preferência do sistema > Horário > Manual
    if (options.enableSystemPreference && systemPreference) {
      targetTheme = systemPreference
    } else if (options.enableTimeBased) {
      targetTheme = currentTimeTheme
    } else {
      return // Nenhuma automação ativa, manter tema manual
    }
    
    // Aplicar tema se diferente do atual
    if ((targetTheme === 'dark' && !isDark) || (targetTheme === 'light' && isDark)) {
      toggleTheme()
    }
  }, [systemPreference, currentTimeTheme, isDark, toggleTheme, options])

  return {
    systemPreference,
    currentTimeTheme,
    isDark,
    toggleTheme,
  }
}

// Componente de controle de tema automático
export const AutoThemeToggle: React.FC = () => {
  const [autoMode, setAutoMode] = useState<'manual' | 'system' | 'time'>('manual')
  const { systemPreference, currentTimeTheme, isDark } = useAutoTheme({
    enableSystemPreference: autoMode === 'system',
    enableTimeBased: autoMode === 'time',
    darkModeStart: 20, // 8 PM
    darkModeEnd: 6, // 6 AM
  })

  const modes = [
    { value: 'manual', label: 'Manual', icon: '🎨' },
    { value: 'system', label: 'Sistema', icon: '🖥️' },
    { value: 'time', label: 'Horário', icon: '🕐' },
  ]

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-700">
      <h3 className="text-white font-semibold mb-3">Tema Automático</h3>
      
      <div className="flex gap-2 mb-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setAutoMode(mode.value as any)}
            className={`flex-1 p-2 rounded-lg text-sm transition-colors ${
              autoMode === mode.value
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <div className="text-lg mb-1">{mode.icon}</div>
            <div>{mode.label}</div>
          </button>
        ))}
      </div>

      {autoMode === 'system' && (
        <div className="text-sm text-zinc-400">
          Tema atual: {isDark ? '🌙 Escuro' : '☀️ Claro'}
          <br />
          Preferência do sistema: {systemPreference === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
        </div>
      )}

      {autoMode === 'time' && (
        <div className="text-sm text-zinc-400">
          Tema atual: {isDark ? '🌙 Escuro' : '☀️ Claro'}
          <br />
          Tema por horário: {currentTimeTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
          <br />
          <span className="text-xs">Modo escuro: 20h - 6h</span>
        </div>
      )}

      {autoMode === 'manual' && (
        <div className="text-sm text-zinc-400">
          Tema atual: {isDark ? '🌙 Escuro' : '☀️ Claro'}
          <br />
          Use o botão de alternância manual
        </div>
      )}
    </div>
  )
}