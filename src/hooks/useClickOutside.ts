import { useEffect } from 'react'

export const useClickOutside = (
  state: boolean,
  setter: React.Dispatch<React.SetStateAction<boolean>>,
  ref: React.RefObject<HTMLElement>,
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state && !ref.current?.contains(event.target as Node)) {
        setter(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [state, setter, ref])
}
