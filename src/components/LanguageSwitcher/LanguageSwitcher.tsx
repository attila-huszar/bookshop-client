import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { languageStorageKey, shopLanguage, type ShopLanguage } from '@/i18n'
import { IconButton } from '@/components/Button'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { getFlagUrl } from '@/helpers/getFlagUrl'
import { languageOptions } from '@/constants/defaultValues'
import { MenuLanguageButton, Switcher } from './LanguageSwitcher.style'

export function LanguageSwitcher({
  variant = 'icon',
}: {
  variant?: 'menu' | 'icon'
}) {
  const { t, i18n } = useTranslation()
  const selected = shopLanguage(i18n.resolvedLanguage)
  const activeLanguage =
    languageOptions.find((option) => option.language === selected) ??
    languageOptions[0]
  const nextLanguage = selected === 'en' ? 'hu' : 'en'
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
    <Switcher $variant={variant} role="group" aria-label={t('language.label')}>
      {variant === 'icon' && (
        <IconButton
          type="button"
          $outline
          $color="var(--color-primary)"
          aria-label={t('language.switchTo', {
            language: t(`language.${nextLanguage}`),
          })}
          title={t('language.switchTo', {
            language: t(`language.${nextLanguage}`),
          })}
          disabled={isLoading}
          onClick={() => void handleLanguageChange(nextLanguage)}
          icon={
            <img
              src={getFlagUrl(activeLanguage.country)}
              alt=""
              width={24}
              height={16}
            />
          }
        />
      )}
      {variant === 'menu' && (
        <MenuLanguageButton
          type="button"
          aria-label={t('language.switchTo', {
            language: t(`language.${nextLanguage}`),
          })}
          title={t('language.switchTo', {
            language: t(`language.${nextLanguage}`),
          })}
          disabled={isLoading}
          onClick={() => void handleLanguageChange(nextLanguage)}>
          <img
            src={getFlagUrl(activeLanguage.country)}
            alt=""
            width={24}
            height={16}
          />
          <span lang={selected}>{t(`language.${selected}`)}</span>
        </MenuLanguageButton>
      )}
      {isLoading && <p role="status">{t('language.loading')}</p>}
      {hasError && <p role="alert">{t('language.loadError')}</p>}
    </Switcher>
  )
}
