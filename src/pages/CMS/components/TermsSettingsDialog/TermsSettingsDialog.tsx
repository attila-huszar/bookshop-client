import { SubmitEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCmsTermsQuery,
  usePublishTermsMutation,
} from '@/store/api/bookshopApi'
import { toast } from '@/components/AppToaster'
import { Button } from '@/components/Button'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import type { ApiError } from '@/types/ApiError'
import type { TermsDocument } from '@/types/Terms'
import { Dialog } from './TermsSettingsDialog.style'

function TermsEditor({
  document,
  onClose,
}: {
  document: TermsDocument | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [content, setContent] = useState(
    document?.content ?? { en: '', hu: '' },
  )
  const [error, setError] = useState<string | ApiError | null>(null)
  const [publishTerms, { isLoading }] = usePublishTermsMutation()
  const saving = useRef(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (saving.current) {
      return
    }

    if (!content.en.trim() || !content.hu.trim()) {
      setError('termsEditor.required')

      return
    }

    setError(null)
    saving.current = true

    try {
      await publishTerms({ content }).unwrap()
      toast.success(t('termsEditor.saved'))
      onClose()
    } catch (publishError) {
      setError(
        getApiError(publishError) ??
          getErrorMessage(publishError, t('termsEditor.saveError')),
      )
    } finally {
      saving.current = false
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <p>{t('termsEditor.help')}</p>
      {document && <p>{t('terms.version', { version: document.version })}</p>}
      {(['en', 'hu'] as const).map((language) => (
        <label key={language}>
          {t(
            language === 'en' ? 'termsEditor.english' : 'termsEditor.hungarian',
          )}
          <textarea
            lang={language}
            value={content[language]}
            rows={8}
            maxLength={20000}
            required
            disabled={isLoading}
            onChange={(event) => {
              setContent((previous) => ({
                ...previous,
                [language]: event.target.value,
              }))
              setError(null)
            }}
          />
        </label>
      ))}
      {error && (
        <p role="alert">
          {typeof error === 'string'
            ? t(error, { defaultValue: error })
            : getErrorMessage(error, t('termsEditor.saveError'))}
        </p>
      )}
      <div className="actions">
        <Button type="button" $inverted onClick={onClose} disabled={isLoading}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {t(isLoading ? 'termsEditor.saving' : 'termsEditor.publish')}
        </Button>
      </div>
    </form>
  )
}

export function TermsSettingsDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { data, isFetching, isError, refetch } = useCmsTermsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()

    return () => dialog?.close()
  }, [])

  return (
    <Dialog
      ref={dialogRef}
      aria-labelledby="terms-settings-title"
      onCancel={onClose}>
      <h2 id="terms-settings-title">{t('terms.title')}</h2>
      {isFetching ? (
        <p role="status">{t('termsEditor.loading')}</p>
      ) : isError ? (
        <>
          <p role="alert">{t('termsEditor.loadError')}</p>
          <Button type="button" onClick={() => void refetch()}>
            {t('terms.reload')}
          </Button>
          <Button type="button" onClick={onClose}>
            {t('common.actions.cancel')}
          </Button>
        </>
      ) : (
        <TermsEditor document={data ?? null} onClose={onClose} />
      )}
    </Dialog>
  )
}
