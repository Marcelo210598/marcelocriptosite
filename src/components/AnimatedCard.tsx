import React, { useState, useEffect } from 'react'
import { useAnimation, useScrollAnimation, useStaggerAnimation } from '../hooks/useAnimation'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  animationType?: 'fadeIn' | 'slideUp' | 'scale' | 'rotate'
  duration?: number
  delay?: number
  hover?: boolean
  onClick?: () => void
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  animationType = 'fadeIn',
  duration = 400,
  delay = 0,
  hover = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const scrollAnimation = useScrollAnimation({ 
    type: animationType, 
    duration, 
    delay 
  })

  const hoverAnimation = useAnimation({
    type: 'scale',
    duration: 200,
    trigger: 'manual'
  })

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (hover) {
      hoverAnimation.startAnimation()
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (hover) {
      hoverAnimation.resetAnimation()
    }
  }

  const scrollStyle = scrollAnimation.getAnimationStyle()
  const hoverStyle = hover && isHovered ? hoverAnimation.getAnimationStyle() : {}
  
  const cardStyle = {
    ...scrollStyle,
    ...hoverStyle,
    transform: hover && isHovered 
      ? 'scale(1.02) translateY(-2px)' 
      : ('transform' in scrollStyle ? scrollStyle.transform : 'none') || 'none'
  }

  return (
    <div
      ref={scrollAnimation.ref}
      className={`animated-card ${className} ${hover ? 'hover:cursor-pointer' : ''}`}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface AnimatedListProps {
  items: Array<{
    id: string | number
    content: React.ReactNode
  }>
  itemClassName?: string
  containerClassName?: string
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale'
  duration?: number
  staggerDelay?: number
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  itemClassName = '',
  containerClassName = '',
  animationType = 'fadeIn',
  duration = 300,
  staggerDelay = 50
}) => {
  const staggerAnimation = useStaggerAnimation(items.length, {
    type: animationType,
    duration,
    delay: staggerDelay
  })

  useEffect(() => {
    staggerAnimation.startAnimation()
  }, [])

  return (
    <div className={`animated-list ${containerClassName}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`animated-list-item ${itemClassName}`}
          style={staggerAnimation.getItemStyle(index)}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  animationType?: 'scale' | 'bounce' | 'pulse'
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  animationType = 'scale'
}) => {
  const [isClicked, setIsClicked] = useState(false)
  const buttonAnimation = useAnimation({
    type: animationType,
    duration: 150,
    trigger: 'manual'
  })

  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      setIsClicked(true)
      buttonAnimation.startAnimation()
      
      setTimeout(() => {
        setIsClicked(false)
        buttonAnimation.resetAnimation()
      }, 200)
      
      onClick()
    }
  }

  const getVariantClasses = () => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }
    
    const stateClasses = disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : loading 
        ? 'opacity-75 cursor-wait' 
        : 'cursor-pointer'
    
    return `${baseClasses} ${variants[variant]} ${sizes[size]} ${stateClasses}`
  }

  const animationStyle = buttonAnimation.getAnimationStyle()
  const buttonStyle = {
    ...animationStyle,
    transform: isClicked ? 'scale(0.95)' : ('transform' in animationStyle ? animationStyle.transform : 'none') || 'none'
  }

  return (
    <button
      className={`animated-button ${getVariantClasses()} ${className}`}
      style={buttonStyle}
      onClick={handleClick}
      disabled={loading || disabled}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

interface AnimatedIconProps {
  children: React.ReactNode
  className?: string
  animationType?: 'bounce' | 'pulse' | 'rotate' | 'scale'
  duration?: number
  delay?: number
  trigger?: 'onHover' | 'onMount' | 'manual'
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  children,
  className = '',
  animationType = 'bounce',
  duration = 500,
  delay = 0,
  trigger = 'onHover'
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const animation = useAnimation({
    type: animationType,
    duration,
    delay,
    trigger: trigger === 'onMount' ? 'onMount' : 'manual'
  })

  useEffect(() => {
    if (trigger === 'onMount') {
      animation.startAnimation()
    }
  }, [])

  const handleMouseEnter = () => {
    if (trigger === 'onHover') {
      setIsHovered(true)
      animation.startAnimation()
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'onHover') {
      setIsHovered(false)
      animation.resetAnimation()
    }
  }

  return (
    <div
      className={`animated-icon ${className}`}
      style={animation.getAnimationStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

export default AnimatedCard