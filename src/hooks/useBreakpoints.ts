import { mediaQuery } from '@/styles/media.breakpoints'
import { useMediaQuery } from './useMediaQuery'

export function useBreakpoints() {
  return {
    isMobile: useMediaQuery(mediaQuery.between('xs', 'sm')),
    isTablet: useMediaQuery(mediaQuery.between('sm', 'md')),
    isLaptop: useMediaQuery(mediaQuery.between('md', 'lg')),
    isDesktop: useMediaQuery(mediaQuery.between('lg', 'xl')),
    isWideDesktop: useMediaQuery(mediaQuery.up('xl')),
  }
}
