import { RefObject, useEffect } from 'react'

export const useClickOutside = (
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutsideClick: () => void,
): void => {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return

      const refArray = Array.isArray(refs) ? refs : [refs]
      const isClickInside = refArray.some((ref) =>
        ref.current?.contains(target),
      )

      if (!isClickInside) {
        onOutsideClick()
      }
    }

    document.addEventListener('pointerdown', handler)

    return () => {
      document.removeEventListener('pointerdown', handler)
    }
  }, [refs, onOutsideClick])
}
