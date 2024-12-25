import { useEffect } from 'react'

type Props = {
  ref: React.RefObject<HTMLElement | null>
  state: boolean
  setter: (state: boolean) => void
}

export const useClickOutside = ({ ref, state, setter }: Props): void => {
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
