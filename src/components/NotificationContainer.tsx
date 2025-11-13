import React from 'react'
import { useNotifications } from '../hooks/useStore'

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-sm
            ${notification.type === 'success' ? 'border-green-500/20 bg-green-500/10 text-green-100' : ''}
            ${notification.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-100' : ''}
            ${notification.type === 'warning' ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-100' : ''}
            ${notification.type === 'info' ? 'border-blue-500/20 bg-blue-500/10 text-blue-100' : ''}
          `}
        >
          <div className="flex-1">
            <div className="font-medium text-sm">{notification.title}</div>
            <div className="text-xs opacity-90">{notification.message}</div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}