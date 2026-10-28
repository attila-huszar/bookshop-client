import { useParams } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTermsDocumentQuery } from '@/store/api/termsApi'
import { Terms } from './Terms'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useParams: vi.fn(),
}))

vi.mock('@/store/api/termsApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/termsApi')>()),
  useTermsDocumentQuery: vi.fn(),
}))

const document = {
  version: '11111111-1111-4111-8111-111111111111',
  content: { en: 'Original English terms', hu: 'Eredeti magyar feltételek' },
  statements: { en: 'English declaration', hu: 'Magyar nyilatkozat' },
  publishedAt: '2026-10-14T10:00:00Z',
}

beforeEach(() => {
  vi.mocked(useParams).mockReturnValue({ version: document.version })
  vi.mocked(useTermsDocumentQuery).mockReturnValue({
    data: document,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
})

describe('Published terms page', () => {
  it('displays and downloads the archived version in the selected language', async () => {
    render(<Terms />)
    expect(screen.getByText('Original English terms')).toBeInTheDocument()
    expect(
      screen.queryByText(`Version: ${document.version}`),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Print' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Language' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      expect.stringContaining(
        `/terms/${document.version}?download=true&language=en`,
      ),
    )

    await act(async () => {
      await i18n.changeLanguage('hu')
    })

    expect(screen.getByText('Eredeti magyar feltételek')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: i18n.t('terms.title') }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `Közzétéve: ${new Date(document.publishedAt).toLocaleDateString('hu')}`,
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Original English terms')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Letöltés' })).toHaveAttribute(
      'href',
      expect.stringContaining(
        `/terms/${document.version}?download=true&language=hu`,
      ),
    )
  })

  it('explains when no terms have been published', () => {
    vi.mocked(useTermsDocumentQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    render(<Terms />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Terms and conditions have not been published yet',
    )
    expect(
      screen.queryByRole('link', { name: 'Download' }),
    ).not.toBeInTheDocument()
  })
})
