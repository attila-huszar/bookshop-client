import { useEffect, useState } from 'react'
import { breakpoints } from '@/styles'

export const useBreakpoints = () => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = width < breakpoints.sm
  const isTablet = width >= breakpoints.sm && width < breakpoints.md

  return { width, isMobile, isTablet }
}
