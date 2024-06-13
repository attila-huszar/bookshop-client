import { RefObject, useEffect } from 'react'

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  state: boolean,
  setter: React.Dispatch<React.SetStateAction<boolean>>,
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state && !ref.current?.contains(event.target as Node)) {
        setter(false)
      }
    }

    document.addEventListener('mouseup', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  }, [ref, state, setter])
}
