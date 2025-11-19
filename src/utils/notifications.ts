export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export function showNotification(message: string, type: NotificationType = 'info'): void {
  // Criar elemento de notificação
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`
  
  // Estilos baseados no tipo
  const styles = {
    success: 'bg-green-900 border border-green-700 text-green-200',
    error: 'bg-red-900 border border-red-700 text-red-200',
    info: 'bg-blue-900 border border-blue-700 text-blue-200',
    warning: 'bg-yellow-900 border border-yellow-700 text-yellow-200'
  }
  
  notification.className += ` ${styles[type]}`
  
  // Conteúdo da notificação
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-lg">${getIcon(type)}</span>
      <span class="text-sm">${message}</span>
      <button class="ml-auto text-lg hover:opacity-70" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `
  
  // Adicionar ao DOM
  document.body.appendChild(notification)
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.remove('translate-x-full')
  }, 100)
  
  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full')
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 5000)
}

function getIcon(type: NotificationType): string {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }
  return icons[type]
}