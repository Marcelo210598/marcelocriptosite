import React from 'react'

interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'error'
  align?: 'left' | 'center' | 'right' | 'justify'
  truncate?: boolean
  leading?: 'tight' | 'normal' | 'relaxed'
}

const sizeClasses = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl lg:text-3xl',
  '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
  '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
  '4xl': 'text-4xl sm:text-5xl lg:text-6xl'
}

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
}

const colorClasses = {
  primary: 'text-white',
  secondary: 'text-zinc-200',
  muted: 'text-zinc-400',
  accent: 'text-indigo-400',
  success: 'text-green-400',
  error: 'text-red-400'
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
}

const leadingClasses = {
  tight: 'leading-tight',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed'
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  truncate = false,
  leading = 'normal'
}) => {
  const baseClasses = [
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    alignClasses[align],
    leadingClasses[leading],
    truncate ? 'truncate' : '',
    className
  ].join(' ')

  return (
    <Component className={baseClasses}>
      {children}
    </Component>
  )
}

// Componentes específicos para casos comuns
export const PageTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ResponsiveText 
    as="h1" 
    size="2xl" 
    weight="bold" 
    color="primary"
    align="center"
    leading="tight"
    className={`mb-4 sm:mb-6 ${className}`}
  >
    {children}
  </ResponsiveText>
)

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ResponsiveText 
    as="h2" 
    size="xl" 
    weight="semibold" 
    color="primary"
    className={`mb-3 sm:mb-4 ${className}`}
  >
    {children}
  </ResponsiveText>
)

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ResponsiveText 
    as="h3" 
    size="lg" 
    weight="medium" 
    color="primary"
    className={`mb-2 ${className}`}
  >
    {children}
  </ResponsiveText>
)

export const BodyText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  muted?: boolean;
  small?: boolean;
}> = ({ 
  children, 
  className = '',
  muted = false,
  small = false
}) => (
  <ResponsiveText 
    size={small ? 'sm' : 'base'}
    color={muted ? 'muted' : 'secondary'}
    leading="relaxed"
    className={`mb-4 last:mb-0 ${className}`}
  >
    {children}
  </ResponsiveText>
)

// Hook para detectar tamanho da tela
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { isMobile, isTablet, isDesktop }
}