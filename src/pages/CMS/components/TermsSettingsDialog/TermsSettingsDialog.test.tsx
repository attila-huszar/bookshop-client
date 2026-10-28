import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useCmsTermsHistoryQuery,
  useCmsTermsQuery,
  useDeleteTermsVersionMutation,
  usePublishTermsMutation,
  useTermsDocumentQuery,
} from '@/store/api/termsApi'
import { TermsSettingsDialog } from './TermsSettingsDialog'

vi.mock('@/store/api/termsApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/termsApi')>()),
  useCmsTermsQuery: vi.fn(),
  useDeleteTermsVersionMutation: vi.fn(),
  useCmsTermsHistoryQuery: vi.fn(),
  usePublishTermsMutation: vi.fn(),
  useTermsDocumentQuery: vi.fn(),
}))

const document = {
  version: 'v1',
  content: { en: 'English terms', hu: 'Magyar feltételek' },
  statements: { en: 'English declaration', hu: 'Magyar nyilatkozat' },
  publishedAt: '2026-10-14T10:00:00Z',
}
const publish = vi.fn()
const deleteVersion = vi.fn()
const deleteUnwrap = vi.fn<() => Promise<null>>()
const previousDocument = {
  ...document,
  version: 'v0',
  content: { en: 'Original English terms', hu: 'Eredeti magyar feltételek' },
  publishedAt: '2026-10-13T09:00:00Z',
}
const unwrap = vi.fn()
const onClose = vi.fn<() => void>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCmsTermsQuery).mockReturnValue({
    data: document,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
  vi.mocked(useCmsTermsHistoryQuery).mockReturnValue({
    data: [document, previousDocument].map(({ version, publishedAt }) => ({
      version,
      publishedAt,
      canDelete: true,
    })),
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
  vi.mocked(useTermsDocumentQuery).mockImplementation((version) => ({
    currentData:
      version === previousDocument.version ? previousDocument : undefined,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }))
  unwrap.mockReset().mockResolvedValue({ ...document, version: 'v2' })
  deleteUnwrap.mockReset().mockResolvedValue(null)
  deleteVersion.mockReturnValue({ unwrap: deleteUnwrap })
  vi.mocked(useDeleteTermsVersionMutation).mockReturnValue([
    deleteVersion,
    { isLoading: false, reset: vi.fn() },
  ])
  publish.mockReturnValue({ unwrap })
  vi.mocked(usePublishTermsMutation).mockReturnValue([
    publish,
    { isLoading: false, reset: vi.fn() },
  ])
})

describe('Terms settings modal', () => {
  it('deletes the selected unused version and closes without publishing', async () => {
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    await user.selectOptions(screen.getByRole('combobox'), 'v0')
    await user.click(
      screen.getByRole('button', { name: 'Delete selected publication' }),
    )

    expect(deleteVersion).toHaveBeenCalledWith('v0')
    expect(onClose).toHaveBeenCalledOnce()
    expect(publish).not.toHaveBeenCalled()
  })

  it('disables deletion for accepted publications', async () => {
    vi.mocked(useCmsTermsHistoryQuery).mockReturnValue({
      data: [
        { version: 'v1', publishedAt: document.publishedAt, canDelete: false },
      ],
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    const remove = screen.getByRole('button', {
      name: 'Delete selected publication',
    })

    expect(remove).toBeDisabled()
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
      /\(Current\) \(Accepted\)$/,
    )
    expect(remove).toHaveAttribute(
      'title',
      'This publication has been accepted for a checkout and cannot be deleted.',
    )
    await user.click(remove)
    expect(deleteVersion).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Save and publish' }),
    ).toBeEnabled()
  })

  it('preserves the draft and shows a translated error when acceptance wins a deletion race', async () => {
    deleteUnwrap.mockRejectedValueOnce({ code: 'TERMS_IN_USE' })
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    await user.type(screen.getByRole('textbox'), ' draft')
    await user.click(
      screen.getByRole('button', { name: 'Delete selected publication' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This publication has been accepted for a checkout and cannot be deleted.',
    )
    expect(screen.getByRole('textbox')).toHaveValue('English terms draft')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('disables competing actions and repeated deletion while removal is pending', () => {
    vi.mocked(useDeleteTermsVersionMutation).mockReturnValue([
      deleteVersion,
      { isLoading: true, reset: vi.fn() },
    ])
    render(<TermsSettingsDialog onClose={onClose} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Save and publish' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Delete selected publication' }),
    ).toBeDisabled()
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('preserves edits across language tabs and publishes both languages', async () => {
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    expect(
      screen.getByRole('dialog', { name: 'Terms and Conditions' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
      /^Published: .*2026.*\d{2}:\d{2}.*\(Current\)$/,
    )
    expect(
      screen.getByRole('combobox', { name: 'Published versions' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Version: v1')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'English terms' })).toHaveValue(
      'English terms',
    )
    expect(screen.getByRole('tab', { name: 'English' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.queryByRole('textbox', { name: 'Hungarian terms' }),
    ).toBeNull()
    const english = screen.getByRole('textbox', { name: 'English terms' })
    await user.clear(english)
    await user.type(english, 'Updated English terms')
    await user.click(screen.getByRole('tab', { name: 'Magyar' }))
    const hungarian = screen.getByRole('textbox', { name: 'Hungarian terms' })
    await user.clear(hungarian)
    await user.type(hungarian, 'Frissített magyar feltételek')
    await user.click(screen.getByRole('tab', { name: 'English' }))
    expect(screen.getByRole('textbox', { name: 'English terms' })).toHaveValue(
      'Updated English terms',
    )
    await user.click(screen.getByRole('button', { name: 'Save and publish' }))

    expect(publish).toHaveBeenCalledWith({
      content: {
        en: 'Updated English terms',
        hu: 'Frissített magyar feltételek',
      },
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
    await userEvent.click(screen.getByRole('tab', { name: 'Magyar' }))
    expect(
      screen.getByRole('textbox', { name: 'Hungarian terms' }),
    ).toHaveValue('Magyar feltételek')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('selects and focuses the missing language before publishing', async () => {
    vi.mocked(useCmsTermsQuery).mockReturnValue({
      data: { ...document, content: { en: 'English terms', hu: '   ' } },
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Save and publish' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter the terms in both English and Hungarian.',
    )
    expect(screen.getByRole('tab', { name: 'Magyar' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByRole('textbox', { name: 'Hungarian terms' }),
    ).toHaveFocus()
    expect(publish).not.toHaveBeenCalled()
    await user.type(
      screen.getByRole('textbox', { name: 'Hungarian terms' }),
      'Magyar feltételek',
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('supports keyboard navigation between language tabs', async () => {
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    const english = screen.getByRole('tab', { name: 'English' })
    const hungarian = screen.getByRole('tab', { name: 'Magyar' })
    await user.click(english)
    await user.keyboard('{ArrowRight}')

    expect(hungarian).toHaveFocus()
    expect(hungarian).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Magyar' })).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(english).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(hungarian).toHaveFocus()
    await user.keyboard('{Home}')
    expect(english).toHaveFocus()
    await user.keyboard('{End}')
    expect(hungarian).toHaveFocus()
  })

  it('offers cancellation without publishing', async () => {
    render(<TermsSettingsDialog onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(publish).not.toHaveBeenCalled()
  })

  it.each(['current', 'history'])(
    'offers retry and cancellation when %s terms fail to load',
    async (failedQuery) => {
      const refetchCurrent = vi.fn()
      const refetchHistory = vi.fn()
      vi.mocked(useCmsTermsQuery).mockReturnValue({
        data: document,
        isFetching: false,
        isError: failedQuery === 'current',
        refetch: refetchCurrent,
      })
      vi.mocked(useCmsTermsHistoryQuery).mockReturnValue({
        data: [],
        isFetching: false,
        isError: failedQuery === 'history',
        refetch: refetchHistory,
      })
      const user = userEvent.setup()
      render(<TermsSettingsDialog onClose={onClose} />)

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Unable to load terms.',
      )
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      await user.click(
        screen.getByRole('button', { name: 'Reload terms and conditions' }),
      )

      expect(refetchCurrent).toHaveBeenCalledOnce()
      expect(refetchHistory).toHaveBeenCalledOnce()
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(onClose).toHaveBeenCalledOnce()
      expect(publish).not.toHaveBeenCalled()
    },
  )

  it('keeps separate drafts when browsing history and republishes only on submission', async () => {
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)
    const history = screen.getByRole('combobox', { name: 'Published versions' })
    expect(
      screen
        .getAllByRole('option')
        .map((option) => option.getAttribute('value')),
    ).toEqual(['v1', 'v0'])
    await user.type(
      screen.getByRole('textbox', { name: 'English terms' }),
      ' current draft',
    )
    await user.selectOptions(history, 'v0')

    expect(screen.getByRole('textbox', { name: 'English terms' })).toHaveValue(
      'Original English terms',
    )
    expect(publish).not.toHaveBeenCalled()
    await user.type(
      screen.getByRole('textbox', { name: 'English terms' }),
      ' revised',
    )
    await user.click(screen.getByRole('tab', { name: 'Magyar' }))
    expect(
      screen.getByRole('textbox', { name: 'Hungarian terms' }),
    ).toHaveValue('Eredeti magyar feltételek')
    await user.selectOptions(history, 'v1')
    await user.click(screen.getByRole('tab', { name: 'English' }))
    expect(screen.getByRole('textbox', { name: 'English terms' })).toHaveValue(
      'English terms current draft',
    )
    await user.selectOptions(history, 'v0')
    expect(screen.getByRole('textbox', { name: 'English terms' })).toHaveValue(
      'Original English terms revised',
    )
    await user.click(screen.getByRole('button', { name: 'Save and publish' }))

    expect(publish).toHaveBeenCalledWith({
      content: {
        en: 'Original English terms revised',
        hu: 'Eredeti magyar feltételek',
      },
    })
    expect(previousDocument.content.en).toBe('Original English terms')
    expect(document.content.en).toBe('English terms')
  })

  it('blocks publishing during archive loading and offers retry after failure', async () => {
    let phase: 'loading' | 'error' | 'loaded' = 'loading'
    const refetch = vi.fn()
    vi.mocked(useTermsDocumentQuery).mockImplementation((version) => ({
      currentData: phase === 'loaded' ? previousDocument : undefined,
      isFetching: version === 'v0' && phase === 'loading',
      isError: version === 'v0' && phase === 'error',
      refetch,
    }))
    const user = userEvent.setup()
    const view = render(<TermsSettingsDialog onClose={onClose} />)
    await user.selectOptions(screen.getByRole('combobox'), 'v0')

    expect(screen.getByRole('status')).toHaveTextContent('Loading terms...')
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Save and publish' }),
    ).toBeDisabled()
    phase = 'error'
    view.rerender(<TermsSettingsDialog onClose={() => onClose()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load terms.')
    expect(
      screen.getByRole('button', { name: 'Save and publish' }),
    ).toBeDisabled()
    await user.click(
      screen.getByRole('button', { name: 'Reload terms and conditions' }),
    )
    expect(refetch).toHaveBeenCalledOnce()
    expect(publish).not.toHaveBeenCalled()
    phase = 'loaded'
    view.rerender(<TermsSettingsDialog onClose={() => onClose()} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('Original English terms')
    expect(
      screen.getByRole('button', { name: 'Save and publish' }),
    ).toBeEnabled()
  })

  it('allows the first publication when there is no history', async () => {
    vi.mocked(useCmsTermsQuery).mockReturnValue({
      data: null,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    vi.mocked(useCmsTermsHistoryQuery).mockReturnValue({
      data: [],
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    })
    const user = userEvent.setup()
    render(<TermsSettingsDialog onClose={onClose} />)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox'), 'First English terms')
    await user.click(screen.getByRole('tab', { name: 'Magyar' }))
    await user.type(screen.getByRole('textbox'), 'Első magyar feltételek')
    await user.click(screen.getByRole('button', { name: 'Save and publish' }))

    expect(publish).toHaveBeenCalledWith({
      content: { en: 'First English terms', hu: 'Első magyar feltételek' },
    })
  })
})
