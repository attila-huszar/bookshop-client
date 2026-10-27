import { SubmitEvent, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ShopLanguage } from '@/i18n'
import {
  useCmsTermsHistoryQuery,
  useCmsTermsQuery,
  useDeleteTermsVersionMutation,
  usePublishTermsMutation,
  useTermsDocumentQuery,
} from '@/store/api/bookshopApi'
import { toast } from '@/components/AppToaster'
import { Button, IconButton } from '@/components/Button'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import { formatDate } from '@/helpers/formatDate'
import { languageOptions } from '@/constants/defaultValues'
import type { ApiError } from '@/types/ApiError'
import type { TermsDocument, TermsDocumentSummary } from '@/types/Terms'
import { BinIcon } from '@/assets/svg'
import { Dialog, LanguageTabs } from './TermsSettingsDialog.style'

function TermsEditor({
  document,
  versions,
  onClose,
}: {
  document: TermsDocument | null
  versions: TermsDocumentSummary[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [selectedVersion, setSelectedVersion] = useState(
    document?.version ?? versions[0]?.version ?? '',
  )
  const [drafts, setDrafts] = useState<
    Partial<Record<string, TermsDocument['content']>>
  >({})
  const archive = useTermsDocumentQuery(selectedVersion, {
    skip: !selectedVersion || selectedVersion === document?.version,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  const selectedDocument =
    selectedVersion === document?.version ? document : archive.currentData
  const content = drafts[selectedVersion] ??
    selectedDocument?.content ?? { en: '', hu: '' }
  const history =
    document && !versions.some((item) => item.version === document.version)
      ? [
          {
            version: document.version,
            publishedAt: document.publishedAt,
            canDelete: undefined,
          },
          ...versions,
        ]
      : versions
  const selectedPublication = versions.find(
    (item) => item.version === selectedVersion,
  )
  const canDelete = selectedPublication?.canDelete === true
  const [language, setLanguage] = useState<ShopLanguage>('en')
  const editorId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [error, setError] = useState<string | ApiError | null>(null)
  const [publishTerms, { isLoading }] = usePublishTermsMutation()
  const [deleteVersion, deletion] = useDeleteTermsVersionMutation()
  const busy = isLoading || deletion.isLoading
  const saving = useRef(false)
  const unavailable =
    busy ||
    archive.isFetching ||
    archive.isError ||
    Boolean(selectedVersion && !selectedDocument)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (saving.current || unavailable) {
      return
    }

    const missingLanguage = languageOptions.find(
      (option) => !content[option.language].trim(),
    )?.language

    if (missingLanguage) {
      setLanguage(missingLanguage)
      setError('termsEditor.required')
      textareaRef.current?.focus()

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

  const handleDelete = async () => {
    if (saving.current || unavailable || !canDelete || !selectedVersion) {
      return
    }

    saving.current = true
    setError(null)

    try {
      await deleteVersion(selectedVersion).unwrap()
      toast.success(t('termsEditor.deleted'))
      onClose()
    } catch (deleteError) {
      setError(
        getApiError(deleteError) ??
          getErrorMessage(deleteError, t('termsEditor.deleteError')),
      )
    } finally {
      saving.current = false
    }
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)}>
      <p>{t('termsEditor.help')}</p>
      {history.length > 0 && (
        <label>
          {t('termsEditor.history')}
          <select
            value={selectedVersion}
            disabled={busy}
            onChange={(event) => {
              setSelectedVersion(event.target.value)
              setError(null)
            }}>
            {history.map((item) => (
              <option key={item.version} value={item.version}>
                {t('terms.published', { date: formatDate(item.publishedAt) })}
                {item.version === document?.version
                  ? ` (${t('termsEditor.current')})`
                  : ''}
                {item.canDelete === false
                  ? ` (${t('termsEditor.accepted')})`
                  : ''}
              </option>
            ))}
          </select>
        </label>
      )}
      {archive.isFetching && <p role="status">{t('termsEditor.loading')}</p>}
      {archive.isError && (
        <div>
          <p role="alert">{t('termsEditor.loadError')}</p>
          <Button type="button" onClick={() => void archive.refetch()}>
            {t('terms.reload')}
          </Button>
        </div>
      )}
      <LanguageTabs role="tablist" aria-label={t('language.label')}>
        {languageOptions.map((option, index) => (
          <button
            key={option.language}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            id={`${editorId}-${option.language}`}
            type="button"
            role="tab"
            aria-label={t(`language.${option.language}`)}
            aria-selected={language === option.language}
            aria-controls={`${editorId}-panel`}
            tabIndex={language === option.language ? 0 : -1}
            onClick={() => setLanguage(option.language)}
            onKeyDown={(event) => {
              let nextIndex: number

              switch (event.key) {
                case 'ArrowRight':
                  nextIndex = (index + 1) % languageOptions.length
                  break
                case 'ArrowLeft':
                  nextIndex =
                    (index - 1 + languageOptions.length) %
                    languageOptions.length
                  break
                case 'Home':
                  nextIndex = 0
                  break
                case 'End':
                  nextIndex = languageOptions.length - 1
                  break
                default:
                  return
              }

              event.preventDefault()
              setLanguage(languageOptions[nextIndex]!.language)
              tabRefs.current[nextIndex]?.focus()
            }}>
            {option.language.toUpperCase()}
          </button>
        ))}
      </LanguageTabs>
      <div
        id={`${editorId}-panel`}
        role="tabpanel"
        aria-labelledby={`${editorId}-${language}`}>
        <label>
          {t(
            language === 'en' ? 'termsEditor.english' : 'termsEditor.hungarian',
          )}
          <textarea
            ref={textareaRef}
            lang={language}
            value={content[language]}
            rows={8}
            maxLength={20000}
            required
            aria-describedby={error ? `${editorId}-error` : undefined}
            disabled={unavailable}
            onChange={(event) => {
              setDrafts((previous) => ({
                ...previous,
                [selectedVersion]: {
                  ...content,
                  [language]: event.target.value,
                },
              }))
              setError(null)
            }}
          />
        </label>
      </div>
      {error && (
        <p id={`${editorId}-error`} role="alert">
          {typeof error === 'string'
            ? t(error, { defaultValue: error })
            : getErrorMessage(error, t('termsEditor.saveError'))}
        </p>
      )}
      <div className="actions">
        <Button type="button" $inverted onClick={onClose} disabled={busy}>
          {t('common.actions.cancel')}
        </Button>
        <IconButton
          type="button"
          aria-label={t('termsEditor.delete')}
          title={t(
            selectedPublication?.canDelete === false
              ? 'termsEditor.inUse'
              : 'termsEditor.delete',
          )}
          icon={<BinIcon aria-hidden="true" />}
          $color="var(--color-outline)"
          $outline
          disabled={unavailable || !canDelete}
          onClick={() => void handleDelete()}
        />
        <Button type="submit" disabled={unavailable}>
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
  const history = useCmsTermsHistoryQuery(undefined, {
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
      {(isFetching && data === undefined) ||
      (history.isFetching && history.data === undefined) ? (
        <p role="status">{t('termsEditor.loading')}</p>
      ) : isError || history.isError ? (
        <>
          <p role="alert">{t('termsEditor.loadError')}</p>
          <div className="actions">
            <Button type="button" $inverted onClick={onClose}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                void refetch()
                void history.refetch()
              }}>
              {t('terms.reload')}
            </Button>
          </div>
        </>
      ) : (
        <TermsEditor
          document={data ?? null}
          versions={history.data ?? []}
          onClose={onClose}
        />
      )}
    </Dialog>
  )
}
