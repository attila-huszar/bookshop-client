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

    document.addEventListener('mouseup', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  }, [state, setter, ref])
}
