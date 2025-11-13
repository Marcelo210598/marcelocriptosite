import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (dark: boolean) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (dark) => set({ isDark: dark })
    }),
    {
      name: 'theme-storage'
    }
  )
)

interface FavoriteState {
  favorites: string[]
  addFavorite: (coinId: string) => void
  removeFavorite: (coinId: string) => void
  isFavorite: (coinId: string) => boolean
}

export const useFavorites = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (coinId) => set((state) => ({ 
        favorites: [...state.favorites, coinId] 
      })),
      removeFavorite: (coinId) => set((state) => ({ 
        favorites: state.favorites.filter(id => id !== coinId) 
      })),
      isFavorite: (coinId) => get().favorites.includes(coinId)
    }),
    {
      name: 'favorites-storage'
    }
  )
)

interface NotificationState {
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    timestamp: number
  }>
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotifications = create<NotificationState>()(
  (set, get) => ({
    notifications: [],
    addNotification: (notification) => {
      const id = Math.random().toString(36).substr(2, 9)
      set((state) => ({
        notifications: [...state.notifications, { ...notification, id, timestamp: Date.now() }]
      }))
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        get().removeNotification(id)
      }, 5000)
    },
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
    clearNotifications: () => set({ notifications: [] })
  })
)