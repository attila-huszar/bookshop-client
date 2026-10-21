import { i18n } from '@/i18n'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageSwitcher } from './LanguageSwitcher'

beforeEach(() => {
  localStorage.removeItem('language')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Language switch loading', () => {
  it('uses i18next to change language and remembers the explicit selection', async () => {
    const changeLanguage = vi.spyOn(i18n, 'changeLanguage')
    render(<LanguageSwitcher />)

    await userEvent.click(screen.getByRole('button', { name: 'Magyar' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Magyar' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
    expect(changeLanguage).toHaveBeenCalledWith('hu')
    expect(localStorage.getItem('language')).toBe('hu')
    expect(document.documentElement.lang).toBe('hu')
  })

  it('shows an error without saving the selection when i18next keeps a fallback language', async () => {
    vi.spyOn(i18n, 'hasResourceBundle').mockImplementation(
      (language) => language === 'en',
    )
    const changeLanguage = vi
      .spyOn(i18n, 'changeLanguage')
      .mockResolvedValue(i18n.t)
    render(<LanguageSwitcher />)
    await userEvent.click(screen.getByRole('button', { name: 'Magyar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load this language',
    )
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Magyar' })).toBeEnabled()
    expect(changeLanguage).toHaveBeenCalledWith('hu')
    expect(localStorage.getItem('language')).toBeNull()
  })
})
