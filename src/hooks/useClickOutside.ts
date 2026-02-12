import { RefObject, useEffect } from 'react'

export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
): void => {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const element = ref.current
      const target = event.target as Node | null
      if (!element || !target) return

      if (!element.contains(target)) {
        onOutsideClick()
      }
    }

    document.addEventListener('pointerdown', handler)

    return () => {
      document.removeEventListener('pointerdown', handler)
    }
  }, [ref, onOutsideClick])
}
