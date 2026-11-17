import type {
  GsiButtonConfiguration,
  IdConfiguration,
} from '@react-oauth/google'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: IdConfiguration) => void
          renderButton: (
            element: HTMLElement,
            options: GsiButtonConfiguration & { locale: string },
          ) => void
        }
      }
    }
  }
}
