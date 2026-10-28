import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCmsEmailOutboxQuery } from '@/store/api/ordersApi'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { ClearButton } from '@/components/Header/components/Search/Search.style'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { formatDate } from '@/helpers/formatDate'
import {
  type EmailOutboxStatus,
  emailOutboxStatuses,
  type OrderEmailType,
  orderEmailTypes,
} from '@/types'
import { SpinnerIcon, XMarkIcon } from '@/assets/svg'
import {
  OutboxContainer,
  OutboxControls,
  OutboxPagination,
  OutboxTable,
  RecipientSearch,
  StatusBadge,
} from './OrderEmails.style'

const dateLabel = (date: string | null) => (date ? formatDate(date) : '—')

export function OrderEmails({ paymentId }: { paymentId: string }) {
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<EmailOutboxStatus | ''>('')
  const [type, setType] = useState<OrderEmailType | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
    setPage(1)
  })
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useCmsEmailOutboxQuery(
    {
      paymentId,
      page,
      limit: 25,
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(search ? { search } : {}),
    },
    { refetchOnMountOrArgChange: true },
  )
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 25))

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    const trimmed = value.trim()
    const nextSearch = trimmed.length >= 2 ? trimmed : ''
    debouncedSearch(nextSearch)

    if (!nextSearch) {
      setSearch('')
      setPage(1)
    }
  }

  return (
    <OutboxContainer
      aria-label={t('cms.emails.forPayment', { paymentId: paymentId })}>
      <OutboxControls>
        <label>
          {t('common.fields.status')}
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as EmailOutboxStatus | '')
              setPage(1)
            }}>
            <option value="">{t('cms.emails.allStatuses')}</option>
            {emailOutboxStatuses.map((value) => (
              <option key={value} value={value}>
                {t(`cms.emails.status.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('cms.emails.type')}
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as OrderEmailType | '')
              setPage(1)
            }}>
            <option value="">{t('cms.emails.allTypes')}</option>
            {orderEmailTypes.map((value) => (
              <option key={value} value={value}>
                {t(`cms.emails.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('cms.emails.recipient')}
          <RecipientSearch>
            <input
              ref={searchRef}
              type="search"
              value={searchInput}
              maxLength={200}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
            {searchInput && (
              <ClearButton
                type="button"
                title={t('cms.emails.clearSearch')}
                aria-label={t('cms.emails.clearSearch')}
                onClick={() => {
                  handleSearchChange('')
                  searchRef.current?.focus()
                }}>
                <XMarkIcon
                  color="var(--color-on-surface-variant)"
                  aria-hidden="true"
                />
              </ClearButton>
            )}
          </RecipientSearch>
        </label>
        <Button
          type="button"
          $size="smMd"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-busy={isFetching}>
          {isFetching && <SpinnerIcon height={22} aria-hidden="true" />}
          {t('common.actions.refresh')}
        </Button>
      </OutboxControls>
      <p>{t('cms.emails.help')}</p>
      {isError && <Alert message={t('cms.emails.error')} />}
      {!isFetching && !isError && data?.entries.length === 0 && (
        <Alert type="info" message={t('cms.emails.empty')} />
      )}
      {data && data.entries.length > 0 && (
        <OutboxTable>
          <table aria-label={t('cms.emails.title')}>
            <thead>
              <tr>
                <th scope="col">{t('common.fields.email')}</th>
                <th scope="col">{t('cms.emails.recipient')}</th>
                <th scope="col">{t('common.fields.status')}</th>
                <th scope="col">{t('cms.emails.attempts')}</th>
                <th scope="col">{t('common.fields.createdAt')}</th>
                <th scope="col">{t('common.fields.updatedAt')}</th>
                <th scope="col">{t('cms.emails.nextAttempt')}</th>
                <th scope="col">{t('cms.emails.failure')}</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {t(`cms.emails.${entry.type}`)}
                    <small>
                      {entry.notificationType === 'new'
                        ? t('cms.emails.newOrder')
                        : entry.notificationType === 'error'
                          ? t('cms.emails.reconciliationFailed')
                          : ''}
                    </small>
                    <small>{entry.id}</small>
                  </td>
                  <td>{entry.recipient}</td>
                  <td>
                    <StatusBadge data-status={entry.status}>
                      {t(`cms.emails.status.${entry.status}`)}
                    </StatusBadge>
                  </td>
                  <td>
                    {t('cms.emails.queue')}
                    {entry.queueAttempts}
                    <small>
                      {t('cms.emails.delivery')} {entry.deliveryAttempts}
                    </small>
                  </td>
                  <td>{dateLabel(entry.createdAt)}</td>
                  <td>
                    {dateLabel(entry.deliveryUpdatedAt ?? entry.processedAt)}
                  </td>
                  <td>{dateLabel(entry.nextAttemptAt)}</td>
                  <td>
                    {entry.failureReason && (
                      <small>{entry.failureReason}</small>
                    )}
                    {entry.lastError ?? (entry.failureReason ? '' : '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </OutboxTable>
      )}
      <OutboxPagination>
        <span>
          {t('cms.emails.pagination', { count: data?.total ?? 0, page, pages })}
        </span>
        <Button
          type="button"
          $size="smMd"
          disabled={page === 1 || isFetching}
          onClick={() => setPage(page - 1)}>
          {t('common.actions.previous')}
        </Button>
        <Button
          type="button"
          $size="smMd"
          disabled={!data || page >= pages || isFetching}
          onClick={() => setPage(page + 1)}>
          {t('common.actions.next')}
        </Button>
      </OutboxPagination>
    </OutboxContainer>
  )
}
