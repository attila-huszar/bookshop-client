import { initReactI18next } from 'react-i18next'
import i18next, { type i18n as I18n } from 'i18next'
import HttpBackend, { type HttpBackendOptions } from 'i18next-http-backend'
import { log } from '@/services/logger'
import { localStorageAdapter } from '@/helpers/browserStorage'

export type ShopLanguage = 'en' | 'hu'
export const languageStorageKey = 'language'

function supportedLanguage(language: unknown): ShopLanguage | undefined {
  if (typeof language !== 'string') {
    return undefined
  }

  const baseLanguage = language.toLowerCase().split('-')[0]

  if (baseLanguage === 'en' || baseLanguage === 'hu') {
    return baseLanguage
  }

  return undefined
}

export function shopLanguage(language: string | undefined): ShopLanguage {
  return supportedLanguage(language) ?? 'en'
}

function storedLanguage(): ShopLanguage | undefined {
  try {
    return supportedLanguage(
      localStorageAdapter.get<unknown>(languageStorageKey),
    )
  } catch {
    return undefined
  }
}

function browserLanguage(): ShopLanguage | undefined {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  return languages
    .map(supportedLanguage)
    .find((language) => language !== undefined)
}

export const i18n: I18n = i18next
  .createInstance()
  .use(HttpBackend)
  .use(initReactI18next)

i18n.on('languageChanged', (language: string) => {
  document.documentElement.lang = shopLanguage(
    i18n.resolvedLanguage ?? language,
  )
})

void i18n.init<HttpBackendOptions>(
  {
    lng: storedLanguage() ?? browserLanguage() ?? 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'hu'],
    preload: ['en', 'hu'],
    load: 'languageOnly',
    maxRetries: 1,
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
      requestOptions: { cache: 'no-cache' },
    },
    interpolation: { escapeValue: false },
  },
  (error: unknown) => {
    if (error) {
      log.error('Unable to initialize translations', { error })
    }
  },
)
