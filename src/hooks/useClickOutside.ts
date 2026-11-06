import { type RefObject, useEffect, useEffectEvent } from 'react'

export const useClickOutside = (
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutsideClick: () => void,
): void => {
  const onPointerDown = useEffectEvent((event: PointerEvent) => {
    const target = event.target

    if (!(target instanceof Node)) {
      return
    }

    const refArray = Array.isArray(refs) ? refs : [refs]
    const elements = refArray
      .map((ref) => ref.current)
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) {
      return
    }

    const dialog = elements.find(
      (el): el is HTMLDialogElement => el.tagName === 'DIALOG',
    )

    if (dialog && !dialog.open) {
      return
    }

    if (dialog && target === dialog) {
      const rect = dialog.getBoundingClientRect()
      const isWithinDialogBox =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom

      if (isWithinDialogBox) {
        return
      }

      onOutsideClick()

      return
    }

    if (elements.some((el) => el.contains(target))) {
      return
    }

    onOutsideClick()
  })

  useEffect(() => {
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])
}
