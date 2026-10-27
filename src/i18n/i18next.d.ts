import 'i18next'
import type en from '../../public/locales/en/translation.json'
import type hu from '../../public/locales/hu/translation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof en & typeof hu }
  }
}
