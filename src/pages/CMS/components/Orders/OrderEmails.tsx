import { useRef, useState } from 'react'
import { useCmsEmailOutboxQuery } from '@/store/api/bookshopApi'
import { Alert, Button } from '@/components'
import { ClearButton } from '@/components/Header/components/Search/Search.style'
import { useDebounce } from '@/hooks'
import { formatDate } from '@/helpers'
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

const typeLabels: Record<OrderEmailType, string> = {
  orderConfirmation: 'Customer confirmation',
  adminPaymentNotification: 'Admin payment notification',
}

const statusLabel = (status: EmailOutboxStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1)
const dateLabel = (date: string | null) => (date ? formatDate(date) : '—')

export function OrderEmails({ paymentId }: { paymentId: string }) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<EmailOutboxStatus | ''>('')
  const [type, setType] = useState<OrderEmailType | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebounce((value: string) => {
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
    <OutboxContainer aria-label={`Emails for payment ${paymentId}`}>
      <OutboxControls>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as EmailOutboxStatus | '')
              setPage(1)
            }}>
            <option value="">All statuses</option>
            {emailOutboxStatuses.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Email type
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as OrderEmailType | '')
              setPage(1)
            }}>
            <option value="">All types</option>
            {orderEmailTypes.map((value) => (
              <option key={value} value={value}>
                {typeLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Recipient
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
                title="Clear recipient search"
                aria-label="Clear recipient search"
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
          Refresh
        </Button>
      </OutboxControls>
      <p>
        Sent means the mail server accepted the email. Processed entries predate
        delivery tracking. Next attempt times are estimates; queued emails wait
        for the worker.
      </p>
      {isError && (
        <Alert message="Could not load order emails. Try refreshing." />
      )}
      {!isFetching && !isError && data?.entries.length === 0 && (
        <Alert type="info" message="No emails for this order" />
      )}
      {data && data.entries.length > 0 && (
        <OutboxTable>
          <table aria-label="Order emails">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Recipient</th>
                <th scope="col">Status</th>
                <th scope="col">Attempts</th>
                <th scope="col">Created</th>
                <th scope="col">Last update</th>
                <th scope="col">Next attempt</th>
                <th scope="col">Failure details</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {typeLabels[entry.type]}
                    <small>
                      {entry.notificationType === 'new'
                        ? 'New order'
                        : entry.notificationType === 'error'
                          ? 'Reconciliation failed'
                          : ''}
                    </small>
                    <small>{entry.id}</small>
                  </td>
                  <td>{entry.recipient}</td>
                  <td>
                    <StatusBadge data-status={entry.status}>
                      {statusLabel(entry.status)}
                    </StatusBadge>
                  </td>
                  <td>
                    Queue: {entry.queueAttempts}
                    <small>Delivery: {entry.deliveryAttempts}</small>
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
          {data?.total ?? 0} emails · Page {page} of {pages}
        </span>
        <Button
          type="button"
          $size="smMd"
          disabled={page === 1 || isFetching}
          onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button
          type="button"
          $size="smMd"
          disabled={!data || page >= pages || isFetching}
          onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </OutboxPagination>
    </OutboxContainer>
  )
}
