import { useEffect, useState } from 'react'
import { showNotification } from '../utils'

export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      setRegistration(registration)
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
              showNotification('Nova versão disponível! Atualize para obter as últimas melhorias.', 'info')
            }
          })
        }
      })

      // Verificar atualizações periodicamente
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000) // Verificar a cada hora

    } catch (error) {
      console.error('Erro ao registrar service worker:', error)
    }
  }

  const updateServiceWorker = async () => {
    if (!registration) return

    try {
      await registration.unregister()
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar service worker:', error)
    }
  }

  return {
    isSupported,
    registration,
    updateAvailable,
    updateServiceWorker
  }
}

// Hook para instalação PWA
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        showNotification('App instalado com sucesso! 🎉', 'success')
        setIsInstallable(false)
      } else {
        showNotification('Instalação cancelada', 'info')
      }
      
      setDeferredPrompt(null)
      return outcome === 'accepted'
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  return {
    isInstallable,
    installPWA
  }
}

// Componente de instalação PWA
export const PWAInstallButton: React.FC = () => {
  const { isInstallable, installPWA } = usePWAInstall()
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    setIsInstalling(true)
    await installPWA()
    setIsInstalling(false)
  }

  if (!isInstallable) return null

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="fixed bottom-32 right-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 z-40"
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Instalando...
        </>
      ) : (
        <>
          📱 Instalar App
        </>
      )}
    </button>
  )
}