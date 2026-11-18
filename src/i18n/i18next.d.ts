import 'i18next'
import type en from './locales/en.json'
import type hu from './locales/hu.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof en & typeof hu }
  }
}
