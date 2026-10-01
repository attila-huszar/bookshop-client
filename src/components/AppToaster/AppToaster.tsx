import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Toaster, useToasterStore } from 'react-hot-toast'
import { registerToastHost, syncToastHost } from './toast'

export function AppToaster() {
  const { toasts } = useToasterStore()
  const [host] = useState(() => {
    const element = document.createElement('div')
    element.style.display = 'contents'
    return element
  })

  useLayoutEffect(() => registerToastHost(host), [host])
  // A dialog may unmount in the same update that emits its success toast.
  useLayoutEffect(() => syncToastHost(), [toasts])

  return createPortal(
    <Toaster
      containerStyle={{ marginTop: '2rem' }}
      toastOptions={{
        duration: 3000,
        style: {
          padding: '8px 10px',
          fontSize: '1.125rem',
          textAlign: 'center',
        },
      }}
    />,
    host,
  )
}
