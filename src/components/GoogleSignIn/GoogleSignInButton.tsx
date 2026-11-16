import { useContext, useEffect, useRef } from 'react'
import type { CredentialResponse } from '@react-oauth/google'
import { GoogleSignInContext } from './GoogleSignIn.context'

type GoogleSignInButtonProps = {
  locale: string
  onSuccess: (response: CredentialResponse) => void
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const { locale, onSuccess } = props
  const context = useContext(GoogleSignInContext)
  const containerRef = useRef<HTMLDivElement>(null)
  const successRef = useRef(onSuccess)
  const mountButton = context?.mountButton

  useEffect(() => {
    successRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    const container = containerRef.current

    if (!container || !mountButton) {
      return
    }

    return mountButton(container, locale, (response) => {
      successRef.current(response)
    })
  }, [locale, mountButton])

  return <div ref={containerRef} style={{ height: 40 }} />
}
