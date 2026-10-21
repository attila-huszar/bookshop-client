import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { shopLanguage } from '@/i18n'
import { useTermsDocumentQuery } from '@/store/api/bookshopApi'
import { Button } from '@/components/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { serverUrl } from '@/constants/envConfig'
import { Article } from './Terms.style'

export function Terms() {
  const { version } = useParams()
  const { t, i18n } = useTranslation()
  const language = shopLanguage(i18n.resolvedLanguage)
  const {
    data: document,
    isLoading,
    isError,
    refetch,
  } = useTermsDocumentQuery(version)

  return (
    <Article lang={language}>
      <h1>{t('terms.title')}</h1>
      {isLoading ? (
        <p role="status">{t('terms.loading')}</p>
      ) : isError ? (
        <>
          <p role="alert">{t('terms.loadError')}</p>
          <Button type="button" onClick={() => void refetch()}>
            {t('terms.reload')}
          </Button>
        </>
      ) : document ? (
        <>
          <p>{t('terms.version', { version: document.version })}</p>
          <p>
            {t('terms.published', {
              date: new Date(document.publishedAt).toLocaleDateString(language),
            })}
          </p>
          <div className="actions">
            <LanguageSwitcher />
            <a
              href={`${serverUrl.replace(/\/$/, '')}/terms/${document.version}?download=true&language=${language}`}>
              {t('terms.download')}
            </a>
            <Button type="button" onClick={() => window.print()}>
              {t('terms.print')}
            </Button>
          </div>
          <pre>{document.content[language]}</pre>
        </>
      ) : (
        <p role="status">{t('terms.notPublished')}</p>
      )}
    </Article>
  )
}
