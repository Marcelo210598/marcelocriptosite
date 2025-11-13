import React from 'react'

export const GlobalLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
      <div className="text-white text-sm font-medium">Carregando...</div>
      <div className="text-zinc-400 text-xs mt-1">Por favor, aguarde</div>
    </div>
  </div>
)

export const InlineLoader: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center gap-3 text-zinc-400">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
      <span className="text-sm">{message}</span>
    </div>
  </div>
)

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-indigo-500 ${sizeClasses[size]} ${className}`}></div>
  )
}