import { RefObject, useEffect } from 'react'

export const useClickOutside = (
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutsideClick: () => void,
): void => {
  useEffect(() => {
    const handler = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return

      const refArray = Array.isArray(refs) ? refs : [refs]
      const elements = refArray
        .map((ref) => ref.current)
        .filter((el): el is HTMLElement => !!el)
      if (elements.length === 0) return

      const dialog = elements.find(
        (el): el is HTMLDialogElement =>
          (typeof HTMLDialogElement !== 'undefined' &&
            el instanceof HTMLDialogElement) ||
          el.tagName === 'DIALOG',
      )
      if (dialog && !dialog.open) return

      if (dialog && target === dialog) {
        const rect = dialog.getBoundingClientRect()
        const isWithinDialogBox =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom

        if (isWithinDialogBox) return
        onOutsideClick()
        return
      }

      const isClickInside = elements.some((el) => el.contains(target))
      if (isClickInside) return

      onOutsideClick()
    }

    document.addEventListener('pointerdown', handler)

    return () => {
      document.removeEventListener('pointerdown', handler)
    }
  }, [refs, onOutsideClick])
}
