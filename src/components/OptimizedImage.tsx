import React, { useState, useEffect, useRef } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
  placeholder?: 'blur' | 'empty'
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height,
  placeholder = 'blur'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(
    placeholder === 'blur' 
      ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjgiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+'
      : ''
  )
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = new Image()
    img.src = src
    
    img.onload = () => {
      setImageSrc(src)
      setImageLoaded(true)
    }

    img.onerror = () => {
      setImageSrc('/placeholder-crypto.png')
      setImageLoaded(true)
    }
  }, [src])

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-50 scale-110'
        }`}
        style={{
          filter: imageLoaded ? 'none' : 'blur(2px)',
        }}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
    </div>
  )
}

// Hook para detectar se o elemento está visível na viewport
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [node, setNode] = useState<HTMLElement | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntry(entry)
        if (node && observer.current) {
          observer.current.unobserve(node)
        }
      }
    }, options)

    const { current: currentObserver } = observer

    if (node) currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [node, options])

  return [setNode, entry?.isIntersecting]
}

// Componente de imagem com lazy loading baseado em viewport
export const LazyImage: React.FC<OptimizedImageProps> = (props) => {
  const [setNode, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  })

  return (
    <div ref={setNode as any}>
      {isIntersecting && <OptimizedImage {...props} />}
    </div>
  )
}