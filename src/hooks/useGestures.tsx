import { useEffect, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  pullToRefreshThreshold?: number;
  swipeThreshold?: number;
}

interface GestureState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

export const useGestures = (config: GestureConfig = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    pullToRefreshThreshold = 100,
    swipeThreshold = 50
  } = config;

  const [gestureState, setGestureState] = useState<GestureState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false
  });

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const isScrollingRef = useRef(false);
  const pullStartRef = useRef<number>(0);

  useEffect(() => {
    let touchStartTime: number;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchEndRef.current = null;
      touchStartTime = Date.now();
      isScrollingRef.current = false;
      
      // Check if we're at the top of the page for pull-to-refresh
      if (window.scrollY <= 0 && onPullToRefresh) {
        pullStartRef.current = touch.clientY;
        setGestureState(prev => ({ ...prev, isPulling: true, pullDistance: 0 }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !touchStartRef.current) return;
      
      const touch = e.touches[0];
      const currentPos = { x: touch.clientX, y: touch.clientY };
      const startPos = touchStartRef.current;
      
      // Detect if user is scrolling
      if (!isScrollingRef.current) {
        const deltaX = Math.abs(currentPos.x - startPos.x);
        const deltaY = Math.abs(currentPos.y - startPos.y);
        
        // If moving more vertically than horizontally, it's scrolling
        if (deltaY > deltaX && deltaY > 10) {
          isScrollingRef.current = true;
          setGestureState(prev => ({ ...prev, isPulling: false }));
        }
      }
      
      // Handle pull-to-refresh
      if (gestureState.isPulling && !isScrollingRef.current && window.scrollY <= 0) {
        const pullDistance = Math.max(0, currentPos.y - pullStartRef.current);
        setGestureState(prev => ({ ...prev, pullDistance: Math.min(pullDistance, 200) }));
        
        // Prevent default scrolling when pulling
        if (pullDistance > 0) {
          e.preventDefault();
        }
      }
      
      touchEndRef.current = currentPos;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !touchEndRef.current) return;
      
      const startPos = touchStartRef.current;
      const endPos = touchEndRef.current;
      const touchDuration = Date.now() - touchStartTime;
      
      // Handle pull-to-refresh
      if (gestureState.isPulling && gestureState.pullDistance >= pullToRefreshThreshold) {
        setGestureState(prev => ({ ...prev, isRefreshing: true, isPulling: false }));
        onPullToRefresh?.();
        
        // Reset after refresh
        setTimeout(() => {
          setGestureState({ isPulling: false, pullDistance: 0, isRefreshing: false });
        }, 1500);
      } else {
        setGestureState({ isPulling: false, pullDistance: 0, isRefreshing: false });
      }
      
      // Only process swipes if not scrolling and quick touch
      if (isScrollingRef.current || touchDuration > 300) {
        touchStartRef.current = null;
        touchEndRef.current = null;
        return;
      }
      
      const deltaX = endPos.x - startPos.x;
      const deltaY = endPos.y - startPos.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Determine swipe direction
      if (absDeltaX > absDeltaY && absDeltaX > swipeThreshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (absDeltaY > absDeltaX && absDeltaY > swipeThreshold) {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
      
      touchStartRef.current = null;
      touchEndRef.current = null;
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullToRefresh, pullToRefreshThreshold, swipeThreshold, gestureState.isPulling, gestureState.pullDistance]);

  return {
    gestureState,
    resetGestures: () => setGestureState({ isPulling: false, pullDistance: 0, isRefreshing: false })
  };
};

// Componente visual para pull-to-refresh
export const PullToRefreshIndicator: React.FC<{ gestureState: GestureState }> = ({ gestureState }) => {
  if (!gestureState.isPulling && !gestureState.isRefreshing) return null;
  
  const progress = Math.min(gestureState.pullDistance / 100, 1);
  const rotation = gestureState.isRefreshing ? 'animate-spin' : '';
  const opacity = gestureState.isPulling ? progress : 1;
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center pointer-events-none"
      style={{ 
        transform: `translateY(${Math.min(gestureState.pullDistance - 40, 20)}px)`,
        opacity: opacity
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
        {gestureState.isRefreshing ? (
          <div className={`w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full ${rotation}`} />
        ) : (
          <div 
            className="w-6 h-6 border-2 border-gray-300 rounded-full transition-all duration-200"
            style={{
              borderTopColor: progress > 0.8 ? '#3B82F6' : '#D1D5DB',
              transform: `rotate(${progress * 360}deg)`
            }}
          />
        )}
      </div>
    </div>
  );
};