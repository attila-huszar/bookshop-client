import { initReactI18next } from 'react-i18next'
import i18next, { type i18n as I18n } from 'i18next'
import { log } from '@/api/logs'
import { localStorageAdapter } from '@/helpers/browserStorage'
import en from './locales/en.json'
import hu from './locales/hu.json'

export type ShopLanguage = 'en' | 'hu'
export const languageStorageKey = 'language'

const locizeProjectId = import.meta.env.VITE_LOCIZE_PROJECT_ID?.trim()

const requestedLanguages = new Set<ShopLanguage>()

const locizeBackend = locizeProjectId
  ? import('i18next-locize-backend').then(
      ({ default: LocizeBackend }) =>
        new LocizeBackend({ projectId: locizeProjectId }),
    )
  : undefined

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

export const i18n: I18n = i18next.createInstance().use(initReactI18next)

function refreshTranslations(language: ShopLanguage) {
  if (!locizeBackend || requestedLanguages.has(language)) {
    return
  }

  requestedLanguages.add(language)

  void locizeBackend
    .then((backend) => {
      backend.read(language, 'translation', (error, resources) => {
        const hasResources =
          resources &&
          typeof resources === 'object' &&
          !Array.isArray(resources)

        if (error || !hasResources) {
          return
        }

        i18n.addResourceBundle(language, 'translation', resources, true, true)
      })
    })
    .catch(() => {
      // The bundled translations remain available if the backend fails to load.
    })
}

i18n.on('languageChanged', (language: string) => {
  const selected = shopLanguage(i18n.resolvedLanguage ?? language)
  document.documentElement.lang = selected
  refreshTranslations(selected)
})

export function listenForLanguageChanges() {
  const synchronize = () => {
    const language = storedLanguage()

    if (!language || language === i18n.resolvedLanguage) {
      return
    }

    void i18n.changeLanguage(language).catch((error: unknown) => {
      log.error('Unable to synchronize language', { error })
    })
  }

  const onStorage = (event: StorageEvent) => {
    if (
      event.storageArea === localStorage &&
      (event.key === languageStorageKey || event.key === null)
    ) {
      synchronize()
    }
  }

  const onForeground = () => {
    if (document.visibilityState === 'visible') {
      synchronize()
    }
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', onForeground)
  window.addEventListener('pageshow', onForeground)
  document.addEventListener('visibilitychange', onForeground)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', onForeground)
    window.removeEventListener('pageshow', onForeground)
    document.removeEventListener('visibilitychange', onForeground)
  }
}

const resources = {
  en: { translation: en },
  hu: { translation: hu },
}

void i18n.init({
  lng: storedLanguage() ?? browserLanguage() ?? 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'hu'],
  resources: locizeBackend ? structuredClone(resources) : resources,
  interpolation: { escapeValue: false },
  react: { bindI18nStore: 'added' },
})
