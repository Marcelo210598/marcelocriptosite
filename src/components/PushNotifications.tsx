import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission
  subscription: PushSubscription | null
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null
  })

  useEffect(() => {
    // Verificar suporte a notificações
    if (!('Notification' in window)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    if (!('PushManager' in window)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    setState(prev => ({ ...prev, isSupported: true, permission: Notification.permission }))

    // Verificar subscription existente
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setState(prev => ({ ...prev, subscription }))
      } catch (error) {
        console.error('Erro ao verificar subscription:', error)
      }
    }

    checkSubscription()
  }, [])

  const requestPermission = async () => {
    if (!state.isSupported) {
      console.log('Notificações não suportadas neste dispositivo')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))
      
      if (permission === 'granted') {
        console.log('Notificações ativadas com sucesso!')
        return true
      } else if (permission === 'denied') {
        console.log('Permissão negada. Ative nas configurações do navegador.')
        return false
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      console.log('Erro ao ativar notificações')
      return false
    }
    
    return false
  }

  const subscribeToPush = async () => {
    if (!state.isSupported || state.permission !== 'granted') {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Chave pública VAPID (em produção, use uma chave real)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qJesyDKYRuBk7SS-qYGs'
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      })

      setState(prev => ({ ...prev, subscription }))
      
      // Enviar subscription para o servidor (em produção)
      console.log('Subscription criada:', subscription)
      
      return true
    } catch (error) {
      console.error('Erro ao criar subscription:', error)
      return false
    }
  }

  const unsubscribeFromPush = async () => {
    if (!state.subscription) return false

    try {
      await state.subscription.unsubscribe()
      setState(prev => ({ ...prev, subscription: null }))
      console.log('Notificações desativadas')
      return true
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error)
      return false
    }
  }

  const sendTestNotification = () => {
    if (!state.isSupported || state.permission !== 'granted') {
      console.log('Ative as notificações primeiro')
      return
    }

    new Notification('Notificação de Teste', {
      body: 'Teste de notificação push funcionando! 🚀',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: 'test-notification',
      requireInteraction: false
    } as NotificationOptions)
  }

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  }
}

export const PushNotificationToggle: React.FC = () => {
  const {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  } = usePushNotifications()

  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (!isSupported) {
      console.log('Notificações não suportadas')
      return
    }

    setIsLoading(true)

    try {
      if (permission !== 'granted') {
        const granted = await requestPermission()
        if (granted) {
          await subscribeToPush()
        }
      } else if (subscription) {
        await unsubscribeFromPush()
      } else {
        await subscribeToPush()
      }
    } catch (error) {
      console.error('Erro ao alternar notificações:', error)
      console.log('Erro ao alternar notificações')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  const isActive = permission === 'granted' && !!subscription

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isActive ? 'Desativar notificações' : 'Ativar notificações'}
      >
        {isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </button>
      
      {isActive && (
        <button
          onClick={sendTestNotification}
          className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          Testar
        </button>
      )}
    </div>
  )
}