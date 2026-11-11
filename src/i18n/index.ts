import { initReactI18next } from 'react-i18next'
import i18next, { type i18n as I18n } from 'i18next'
import HttpBackend, { type HttpBackendOptions } from 'i18next-http-backend'
import { log } from '@/api/logs'
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

export function listenForLanguageChanges(hot?: ImportMeta['hot']) {
  let stopped = false

  const synchronize = async () => {
    const language = storedLanguage()

    if (!language || language === i18n.resolvedLanguage) {
      return
    }

    try {
      await i18n.loadLanguages(language)

      if (
        stopped ||
        storedLanguage() !== language ||
        !i18n.hasResourceBundle(language, 'translation')
      ) {
        return
      }

      await i18n.changeLanguage(language)
    } catch (error) {
      log.error('Unable to synchronize language', { error })
    }
  }

  const onStorage = (event: StorageEvent) => {
    if (
      event.storageArea === localStorage &&
      (event.key === languageStorageKey || event.key === null)
    ) {
      void synchronize()
    }
  }

  const onForeground = () => {
    if (document.visibilityState === 'visible') {
      void synchronize()
    }
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', onForeground)
  window.addEventListener('pageshow', onForeground)
  document.addEventListener('visibilitychange', onForeground)

  const stop = () => {
    stopped = true
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', onForeground)
    window.removeEventListener('pageshow', onForeground)
    document.removeEventListener('visibilitychange', onForeground)
  }

  hot?.dispose(stop)

  return stop
}

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
