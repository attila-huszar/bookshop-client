import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { shopLanguage } from '@/i18n'
import { useTermsDocumentQuery } from '@/store/api/termsApi'
import { Button } from '@/components/Button'
import { serverUrl } from '@/constants/envConfig'
import { Article, DownloadButton, PublishedDate } from './Terms.style'

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
          <PublishedDate>
            {t('terms.published', {
              date: new Date(document.publishedAt).toLocaleDateString(language),
            })}
          </PublishedDate>
          <pre>{document.content[language]}</pre>
          <DownloadButton
            as="a"
            href={`${serverUrl.replace(/\/$/, '')}/terms/${document.version}?download=true&language=${language}`}>
            {t('terms.download')}
          </DownloadButton>
        </>
      ) : (
        <p role="status">{t('terms.notPublished')}</p>
      )}
    </Article>
  )
}
