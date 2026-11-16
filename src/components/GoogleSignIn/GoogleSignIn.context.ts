import { createContext } from 'react'
import type { CredentialResponse } from '@react-oauth/google'

export type GoogleChallenge = {
  nonce: string
  signal: AbortSignal
}

type GoogleSignInContextValue = {
  scriptStatus: 'loading' | 'ready' | 'error'
  challenge: GoogleChallenge | undefined
  nonceFailed: boolean
  ensureChallenge: () => void
  renewChallenge: () => void
  invalidateChallenge: () => void
  mountButton: (
    container: HTMLElement,
    locale: string,
    onSuccess: (response: CredentialResponse) => void,
  ) => (() => void) | undefined
}

export const GoogleSignInContext = createContext<
  GoogleSignInContextValue | undefined
>(undefined)
