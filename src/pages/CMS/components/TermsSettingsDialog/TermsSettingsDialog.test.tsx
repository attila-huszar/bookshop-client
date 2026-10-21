import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useCmsTermsQuery,
  usePublishTermsMutation,
} from '@/store/api/bookshopApi'
import { TermsSettingsDialog } from './TermsSettingsDialog'

vi.mock('@/store/api/bookshopApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/bookshopApi')>()),
  useCmsTermsQuery: vi.fn(),
  usePublishTermsMutation: vi.fn(),
}))

const document = {
  version: 'v1',
  content: { en: 'English terms', hu: 'Magyar feltételek' },
  statements: { en: 'English declaration', hu: 'Magyar nyilatkozat' },
  publishedAt: '2026-10-14T10:00:00Z',
}
const publish = vi.fn()
const unwrap = vi.fn()
const onClose = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCmsTermsQuery).mockReturnValue({
    data: document,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
  unwrap.mockReset().mockResolvedValue({ ...document, version: 'v2' })
  publish.mockReturnValue({ unwrap })
  vi.mocked(usePublishTermsMutation).mockReturnValue([
    publish,
    { isLoading: false, reset: vi.fn() },
  ])
})

describe('Terms settings modal', () => {
  it('loads both languages and submits only the edited text', async () => {
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    expect(
      screen.getByRole('dialog', { name: 'Terms and Conditions' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'English terms' })).toHaveValue(
      'English terms',
    )
    const hungarian = screen.getByRole('textbox', { name: 'Hungarian terms' })
    await user.clear(hungarian)
    await user.type(hungarian, 'Frissített magyar feltételek')
    await user.click(screen.getByRole('button', { name: 'Save and publish' }))

    expect(publish).toHaveBeenCalledWith({
      content: { en: 'English terms', hu: 'Frissített magyar feltételek' },
    })
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(document.content.hu).toBe('Magyar feltételek')
  })

  it('keeps the modal and edited values after a failed save', async () => {
    unwrap.mockRejectedValueOnce({ message: 'Unable to save' })
    render(<TermsSettingsDialog onClose={onClose} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Save and publish' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save')
    expect(
      screen.getByRole('textbox', { name: 'Hungarian terms' }),
    ).toHaveValue('Magyar feltételek')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('offers cancellation without publishing', async () => {
    render(<TermsSettingsDialog onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(publish).not.toHaveBeenCalled()
  })
})
