import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string
  height?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height 
}) => {
  const baseClasses = 'skeleton-shimmer bg-zinc-700'
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  }
  
  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '100px')
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export const MarketSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <Skeleton variant="text" width="80px" height="12px" className="mb-2" />
        <Skeleton variant="text" width="120px" height="20px" />
      </div>
    ))}
  </div>
)

export const NewsCarouselSkeleton: React.FC = () => (
  <div className="relative mt-4 overflow-hidden rounded-lg border border-zinc-700">
    <Skeleton variant="rectangular" height="208px" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <Skeleton variant="text" width="120px" height="12px" className="mb-2" />
      <Skeleton variant="text" width="80%" height="16px" />
    </div>
  </div>
)

export const CoinListSkeleton: React.FC = () => (
  <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-700 bg-zinc-900">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-3 py-3">
        <Skeleton variant="circular" width="24px" height="24px" />
        <div className="flex-1">
          <Skeleton variant="text" width="100px" height="14px" className="mb-1" />
          <Skeleton variant="text" width="60px" height="10px" />
        </div>
        <Skeleton variant="text" width="50px" height="14px" />
      </div>
    ))}
  </div>
)