import React, { useState, useEffect } from 'react'
import { useAnimation } from '../hooks/useAnimation'

interface AnimatedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  text?: string
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'wave'
  className?: string
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  size = 'md',
  color = '#3B82F6',
  text = 'Carregando...',
  type = 'spinner',
  className = ''
}) => {
  const loadingAnimation = useAnimation({
    type: 'fadeIn',
    duration: 300,
    trigger: 'onMount'
  })

  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    }
    return sizes[size]
  }

  const renderLoading = () => {
    const baseClasses = `animate-pulse ${getSizeClasses()}`

    switch (type) {
      case 'spinner':
        return (
          <div className={`${baseClasses} border-2 border-current border-t-transparent rounded-full animate-spin`}>
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-current animate-spin" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 ${color} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div className={`${baseClasses} ${color} rounded-full animate-ping`}></div>
        )

      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 ${color} rounded animate-pulse`}
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 ${color} rounded-full`}
                style={{
                  height: `${Math.sin(i * 0.8) * 15 + 15}px`,
                  animation: 'wave 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )

      default:
        return (
          <div className={`${baseClasses} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
        )
    }
  }

  return (
    <div 
      className={`animated-loading flex flex-col items-center justify-center space-y-3 ${className}`}
      style={loadingAnimation.getAnimationStyle()}
    >
      {renderLoading()}
      {text && (
        <div className="text-sm text-zinc-400 animate-pulse">
          {text}
        </div>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'wave'
  className?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Carregando...',
  type = 'spinner',
  className = ''
}) => {
  const [showOverlay, setShowOverlay] = useState(isLoading)
  const overlayAnimation = useAnimation({
    type: 'fadeIn',
    duration: 200,
    trigger: 'manual'
  })

  useEffect(() => {
    if (isLoading) {
      setShowOverlay(true)
      overlayAnimation.startAnimation()
    } else {
      overlayAnimation.resetAnimation()
      setTimeout(() => {
        setShowOverlay(false)
      }, 200)
    }
  }, [isLoading, overlayAnimation])

  if (!showOverlay) return null

  return (
    <div 
      className={`loading-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      style={overlayAnimation.getAnimationStyle()}
    >
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <AnimatedLoading
          size="lg"
          text={text}
          type={type}
        />
      </div>
    </div>
  )
}

interface SkeletonLoaderProps {
  count?: number
  type?: 'card' | 'list' | 'chart' | 'text'
  className?: string
}

export const AnimatedSkeleton: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  type = 'card',
  className = ''
}) => {
  const skeletonAnimation = useAnimation({
    type: 'fadeIn',
    duration: 300,
    trigger: 'onMount'
  })

  const renderSkeleton = () => {
    const baseClasses = 'bg-zinc-700 rounded animate-pulse'

    switch (type) {
      case 'card':
        return (
          <div className={`${baseClasses} h-32 w-full`}></div>
        )

      case 'list':
        return (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`${baseClasses} w-12 h-12 rounded-full`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`${baseClasses} h-4 w-3/4`}></div>
                  <div className={`${baseClasses} h-3 w-1/2`}></div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'chart':
        return (
          <div className={`${baseClasses} h-48 w-full`}></div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            <div className={`${baseClasses} h-4 w-full`}></div>
            <div className={`${baseClasses} h-4 w-5/6`}></div>
            <div className={`${baseClasses} h-4 w-3/4`}></div>
          </div>
        )

      default:
        return (
          <div className={`${baseClasses} h-32 w-full`}></div>
        )
    }
  }

  return (
    <div 
      className={`animated-skeleton ${className}`}
      style={skeletonAnimation.getAnimationStyle()}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4 last:mb-0">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#3B82F6',
  size = 'md',
  animated = true,
  className = ''
}) => {
  const [currentProgress, setCurrentProgress] = useState(0)
  const progressAnimation = useAnimation({
    type: 'fadeIn',
    duration: 300,
    trigger: 'onMount'
  })

  useEffect(() => {
    if (animated) {
      // Animate progress from 0 to target value
      const steps = 50
      const stepDuration = 20
      
      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          const currentProgress = (progress * i) / steps
          setCurrentProgress(currentProgress)
        }, i * stepDuration)
      }
    } else {
      setCurrentProgress(progress)
    }
  }, [progress, animated])

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }
    return sizes[size]
  }

  return (
    <div 
      className={`animated-progress-bar w-full bg-zinc-700 rounded-full overflow-hidden ${getSizeClasses()} ${className}`}
      style={progressAnimation.getAnimationStyle()}
    >
      <div 
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ 
          width: `${currentProgress}%`,
          backgroundColor: color
        }}
      />
    </div>
  )
}

export default AnimatedLoading