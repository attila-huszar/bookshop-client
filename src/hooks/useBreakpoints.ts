import { useSyncExternalStore } from 'react'
import { breakpoints } from '@/styles/media.breakpoints'

const subscribe = (onChange: () => void) => {
  window.addEventListener('resize', onChange)

  return () => window.removeEventListener('resize', onChange)
}

const getBreakpoint = () => {
  if (window.innerWidth < breakpoints.sm) {
    return 'mobile'
  }

  return window.innerWidth < breakpoints.md ? 'tablet' : 'desktop'
}

export const useBreakpoints = () => {
  const breakpoint = useSyncExternalStore(subscribe, getBreakpoint)

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
  }
}
