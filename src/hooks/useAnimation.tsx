import { useState, useEffect, useCallback } from 'react'

export type AnimationType = 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'bounce' | 'pulse'

export interface AnimationConfig {
  type: AnimationType
  duration?: number
  delay?: number
  easing?: string
  trigger?: 'onMount' | 'onScroll' | 'onHover' | 'manual'
}

export const useAnimation = (config: AnimationConfig = { type: 'fadeIn' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const { type, duration = 300, delay = 0, easing = 'ease-out', trigger = 'onMount' } = config

  const startAnimation = useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    setTimeout(() => {
      setIsVisible(true)
      
      setTimeout(() => {
        setIsAnimating(false)
      }, duration)
    }, delay)
  }, [delay, duration, isAnimating])

  const resetAnimation = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
  }, [])

  const getAnimationStyle = useCallback(() => {
    if (!isVisible) {
      const initialStyles = {
        fadeIn: { opacity: 0 },
        slideUp: { opacity: 0, transform: 'translateY(20px)' },
        slideDown: { opacity: 0, transform: 'translateY(-20px)' },
        slideLeft: { opacity: 0, transform: 'translateX(20px)' },
        slideRight: { opacity: 0, transform: 'translateX(-20px)' },
        scale: { opacity: 0, transform: 'scale(0.9)' },
        rotate: { opacity: 0, transform: 'rotate(-5deg)' },
        bounce: { opacity: 0, transform: 'translateY(10px)' },
        pulse: { opacity: 0, transform: 'scale(1)' }
      }
      return initialStyles[type] || initialStyles.fadeIn
    }

    const activeStyles = {
      fadeIn: { opacity: 1 },
      slideUp: { opacity: 1, transform: 'translateY(0)' },
      slideDown: { opacity: 1, transform: 'translateY(0)' },
      slideLeft: { opacity: 1, transform: 'translateX(0)' },
      slideRight: { opacity: 1, transform: 'translateX(0)' },
      scale: { opacity: 1, transform: 'scale(1)' },
      rotate: { opacity: 1, transform: 'rotate(0deg)' },
      bounce: { opacity: 1, transform: 'translateY(0)' },
      pulse: { 
        opacity: 1, 
        transform: 'scale(1)',
        animation: 'pulse 2s infinite'
      }
    }

    return {
      ...activeStyles[type],
      transition: `all ${duration}ms ${easing}`
    }
  }, [isVisible, type, duration, easing])

  useEffect(() => {
    if (trigger === 'onMount') {
      startAnimation()
    }
  }, [trigger, startAnimation])

  return {
    isVisible,
    isAnimating,
    startAnimation,
    resetAnimation,
    getAnimationStyle
  }
}

export const useScrollAnimation = (config: Omit<AnimationConfig, 'trigger'> = { type: 'fadeIn' }) => {
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null)
  const animation = useAnimation({ ...config, trigger: 'manual' })

  useEffect(() => {
    if (!elementRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animation.startAnimation()
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(elementRef)

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef)
      }
    }
  }, [elementRef, animation])

  return {
    ref: setElementRef,
    ...animation
  }
}

export const useStaggerAnimation = (itemsCount: number, config: AnimationConfig = { type: 'fadeIn' }) => {
  const [items, setItems] = useState<boolean[]>(Array(itemsCount).fill(false))
  const [isAnimating, setIsAnimating] = useState(false)

  const startAnimation = useCallback(() => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    items.forEach((_, index) => {
      setTimeout(() => {
        setItems(prev => {
          const newItems = [...prev]
          newItems[index] = true
          return newItems
        })
        
        if (index === items.length - 1) {
          setTimeout(() => {
            setIsAnimating(false)
          }, config.duration || 300)
        }
      }, (config.delay || 0) + (index * (config.duration || 300) * 0.1))
    })
  }, [items.length, config, isAnimating])

  const resetAnimation = useCallback(() => {
    setItems(Array(itemsCount).fill(false))
    setIsAnimating(false)
  }, [itemsCount])

  const getItemStyle = useCallback((index: number) => {
    if (!items[index]) {
      const initialStyles = {
        fadeIn: { opacity: 0 },
        slideUp: { opacity: 0, transform: 'translateY(20px)' },
        slideDown: { opacity: 0, transform: 'translateY(-20px)' },
        slideLeft: { opacity: 0, transform: 'translateX(20px)' },
        slideRight: { opacity: 0, transform: 'translateX(-20px)' },
        scale: { opacity: 0, transform: 'scale(0.9)' },
        rotate: { opacity: 0, transform: 'rotate(-180deg)' },
        bounce: { opacity: 0, transform: 'translateY(0)' },
        pulse: { opacity: 0 }
      }
      return initialStyles[config.type] || initialStyles.fadeIn
    }

    const activeStyles = {
      fadeIn: { opacity: 1 },
      slideUp: { opacity: 1, transform: 'translateY(0)' },
      slideDown: { opacity: 1, transform: 'translateY(0)' },
      slideLeft: { opacity: 1, transform: 'translateX(0)' },
      slideRight: { opacity: 1, transform: 'translateX(0)' },
      scale: { opacity: 1, transform: 'scale(1)' },
      rotate: { opacity: 1, transform: 'rotate(0deg)' },
      bounce: { opacity: 1, transform: 'translateY(0)' },
      pulse: { opacity: 1 }
    }

    return {
      ...activeStyles[config.type],
      transition: `all ${config.duration || 300}ms ${config.easing || 'ease-out'}`
    }
  }, [items, config])

  return {
    items,
    isAnimating,
    startAnimation,
    resetAnimation,
    getItemStyle
  }
}