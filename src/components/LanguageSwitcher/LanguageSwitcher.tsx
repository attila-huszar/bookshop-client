import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { languageStorageKey, shopLanguage, type ShopLanguage } from '@/i18n'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { getFlagUrl } from '@/helpers/getFlagUrl'
import { languageOptions } from '@/constants/defaultValues'
import { Switcher } from './LanguageSwitcher.style'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const selected = shopLanguage(i18n.resolvedLanguage)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const switching = useRef(false)

  const handleLanguageChange = async (language: ShopLanguage) => {
    if (switching.current) {
      return
    }

    switching.current = true
    setIsLoading(true)
    setHasError(false)

    try {
      await i18n.changeLanguage(language)

      if (!i18n.hasResourceBundle(language, 'translation')) {
        setHasError(true)

        return
      }

      try {
        localStorageAdapter.set(languageStorageKey, language)
      } catch {
        // Language switching still works when browser storage is unavailable.
      }
    } catch {
      setHasError(true)
    } finally {
      switching.current = false
      setIsLoading(false)
    }
  }

  return (
    <Switcher role="group" aria-label={t('language.label')}>
      {languageOptions.map(({ language, country }) => (
        <button
          key={language}
          type="button"
          lang={language}
          aria-label={t(`language.${language}`)}
          aria-pressed={selected === language}
          disabled={isLoading}
          onClick={() => void handleLanguageChange(language)}>
          <img src={getFlagUrl(country)} alt="" width={20} height={14} />
          {language.toUpperCase()}
        </button>
      ))}
      {isLoading && <p role="status">{t('language.loading')}</p>}
      {hasError && <p role="alert">{t('language.loadError')}</p>}
    </Switcher>
  )
}
