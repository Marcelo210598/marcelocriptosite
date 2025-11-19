import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnimation } from '../hooks/useAnimation'

interface PageTransitionProps {
  children: React.ReactNode
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale'
  duration?: number
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  animationType = 'fadeIn',
  duration = 300,
  className = ''
}) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const animation = useAnimation({ 
    type: animationType, 
    duration,
    trigger: 'manual'
  })

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true)
      
      // Start exit animation
      setTimeout(() => {
        setDisplayLocation(location)
        animation.resetAnimation()
        
        // Start enter animation
        setTimeout(() => {
          animation.startAnimation()
          setIsTransitioning(false)
        }, duration / 2)
      }, duration / 2)
    }
  }, [location, displayLocation, animation, duration])

  useEffect(() => {
    // Initial animation
    animation.startAnimation()
  }, [])

  return (
    <div 
      className={`transition-container ${className} ${isTransitioning ? 'transitioning' : ''}`}
      style={animation.getAnimationStyle()}
    >
      {children}
    </div>
  )
}

interface AnimatedRouteProps {
  children: React.ReactNode
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale'
  duration?: number
}

export const AnimatedRoute: React.FC<AnimatedRouteProps> = ({
  children,
  animationType = 'fadeIn',
  duration = 300
}) => {
  const animation = useAnimation({ 
    type: animationType, 
    duration,
    trigger: 'onMount'
  })

  return (
    <div 
      className="animated-route"
      style={animation.getAnimationStyle()}
    >
      {children}
    </div>
  )
}

export const LoadingTransition: React.FC<{ isLoading?: boolean; children: React.ReactNode }> = ({ 
  isLoading = false, 
  children 
}) => {
  const [showLoading, setShowLoading] = useState(isLoading)
  const loadingAnimation = useAnimation({ type: 'fadeIn', duration: 200 })
  const contentAnimation = useAnimation({ type: 'fadeIn', duration: 200 })

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
      loadingAnimation.startAnimation()
      contentAnimation.resetAnimation()
    } else {
      loadingAnimation.resetAnimation()
      setTimeout(() => {
        setShowLoading(false)
        contentAnimation.startAnimation()
      }, 200)
    }
  }, [isLoading, loadingAnimation, contentAnimation])

  return (
    <div className="loading-transition">
      {showLoading && (
        <div 
          className="loading-overlay"
          style={loadingAnimation.getAnimationStyle()}
        >
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <span className="loading-text">Carregando...</span>
          </div>
        </div>
      )}
      
      <div 
        className="content-wrapper"
        style={contentAnimation.getAnimationStyle()}
      >
        {children}
      </div>
    </div>
  )
}

export const SmoothTransition: React.FC<{
  show: boolean
  children: React.ReactNode
  animationType?: 'fadeIn' | 'slideUp' | 'scale'
  duration?: number
  className?: string
}> = ({ 
  show, 
  children, 
  animationType = 'fadeIn', 
  duration = 300,
  className = ''
}) => {
  const animation = useAnimation({ 
    type: animationType, 
    duration,
    trigger: 'manual'
  })

  useEffect(() => {
    if (show) {
      animation.startAnimation()
    } else {
      animation.resetAnimation()
    }
  }, [show, animation])

  if (!show && !animation.isVisible) return null

  return (
    <div 
      className={`smooth-transition ${className}`}
      style={animation.getAnimationStyle()}
    >
      {children}
    </div>
  )
}

export default PageTransition