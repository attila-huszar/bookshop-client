import { useParams } from 'react-router'
import { PATH } from '@/api/path'
import { useTermsDocumentQuery } from '@/store/api/termsApi'
import { Button } from '@/components/Button'
import { useLanguage } from '@/hooks/useLanguage'
import { serverUrl } from '@/constants/envConfig'
import { timeZone } from '@/constants/time'
import { Article, DownloadButton, PublishedDate } from './Terms.style'

function Terms() {
  const { version } = useParams()
  const { t, language } = useLanguage()
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
              date: new Date(document.publishedAt).toLocaleDateString(
                language,
                { timeZone },
              ),
            })}
          </PublishedDate>
          <pre>{document.content[language]}</pre>
          <DownloadButton
            as="a"
            href={`${serverUrl.replace(/\/$/, '')}/${PATH.terms.byVersion(document.version)}?download=true&language=${language}`}>
            {t('terms.download')}
          </DownloadButton>
        </>
      ) : (
        <p role="status">{t('terms.notPublished')}</p>
      )}
    </Article>
  )
}

export { Terms as Component }
