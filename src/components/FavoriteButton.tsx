import React from 'react'
import { Star } from 'lucide-react'
import { useFavorites, useNotifications } from '../hooks/useStore'

interface FavoriteButtonProps {
  coinId: string
  coinName: string
  size?: 'sm' | 'md' | 'lg'
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  coinId, 
  coinName, 
  size = 'md' 
}) => {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { addNotification } = useNotifications()
  
  const favorite = isFavorite(coinId)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (favorite) {
      removeFavorite(coinId)
      addNotification({
        title: 'Removido dos favoritos',
        message: `${coinName} foi removido da sua lista de favoritos`,
        type: 'info'
      })
    } else {
      addFavorite(coinId)
      addNotification({
        title: 'Adicionado aos favoritos',
        message: `${coinName} foi adicionado à sua lista de favoritos`,
        type: 'success'
      })
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`
        ${sizeClasses[size]} transition-all duration-200 hover:scale-110
        ${favorite ? 'text-yellow-400' : 'text-zinc-400 hover:text-yellow-400'}
      `}
      aria-label={favorite ? `Remover ${coinName} dos favoritos` : `Adicionar ${coinName} aos favoritos`}
    >
      <Star fill={favorite ? 'currentColor' : 'none'} />
    </button>
  )
}