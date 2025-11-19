import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'transparent';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder = 'blur',
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    // Gerar diferentes tamanhos de imagem para responsividade
    const imageSizes = generateImageSizes(src);
    
    // Usar Intersection Observer para lazy loading
    if (loading === 'lazy' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(imageSizes.default);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    } else {
      setCurrentSrc(imageSizes.default);
    }
  }, [src, loading]);

  const generateImageSizes = (originalSrc: string) => {
    // Simular geração de múltiplos tamanhos (em produção, isso seria feito no build)
    const baseUrl = originalSrc.split('?')[0];
    return {
      default: originalSrc,
      small: `${baseUrl}?w=320`,
      medium: `${baseUrl}?w=640`,
      large: `${baseUrl}?w=1024`
    };
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const getPlaceholderStyle = () => {
    if (placeholder === 'blur') {
      return {
        filter: 'blur(20px)',
        transform: 'scale(1.1)',
        transition: 'filter 0.3s ease-out, transform 0.3s ease-out'
      };
    }
    return {};
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%'
        }}
      />
      
      {/* Placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
          style={getPlaceholderStyle()}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      {/* Fallback em caso de erro */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Imagem não disponível</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook para pré-carregar imagens críticas
export const useImagePreloader = (imageUrls: string[]) => {
  useEffect(() => {
    const preloadImages = async () => {
      const promises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        console.log('Imagens críticas pré-carregadas');
      } catch (error) {
        console.warn('Erro ao pré-carregar imagens:', error);
      }
    };

    if (imageUrls.length > 0) {
      preloadImages();
    }
  }, [imageUrls]);
};

// Componente de imagem com WebP fallback
export const WebPImage: React.FC<OptimizedImageProps & { webpSrc?: string }> = ({
  webpSrc,
  src,
  ...props
}) => {
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    // Detectar suporte a WebP
    const checkWebPSupport = async () => {
      if (!webpSrc) return;
      
      try {
        const webP = new Image();
        webP.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        webP.onload = webP.onerror = () => {
          setSupportsWebP(webP.height === 2);
        };
      } catch (error) {
        setSupportsWebP(false);
      }
    };

    checkWebPSupport();
  }, [webpSrc]);

  const finalSrc = supportsWebP && webpSrc ? webpSrc : src;

  return <OptimizedImage {...props} src={finalSrc} />;
};

// Componente de imagem preguiçosa com Intersection Observer
export const LazyImage: React.FC<OptimizedImageProps> = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef}>
      {isVisible ? <OptimizedImage {...props} /> : <div className={props.className} style={{ width: props.width, height: props.height }} />}
    </div>
  );
};