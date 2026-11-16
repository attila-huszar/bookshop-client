import { i18n } from '@/i18n'
import { render, screen, waitFor, within } from '@testing-library/react'
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
  it('keeps the current icon and reports failure without saving a fallback selection', async () => {
    vi.spyOn(i18n, 'hasResourceBundle').mockImplementation(
      (language) => language === 'en',
    )
    const changeLanguage = vi
      .spyOn(i18n, 'changeLanguage')
      .mockResolvedValue(i18n.t)
    render(<LanguageSwitcher variant="icon" />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to Magyar' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load this language',
    )
    const button = screen.getByRole('button', { name: 'Switch to Magyar' })
    expect(button).toBeEnabled()
    expect(within(button).getByAltText('')).toHaveAttribute(
      'src',
      'https://flagcdn.com/gb.svg',
    )
    expect(localStorage.getItem('language')).toBeNull()
    expect(changeLanguage).toHaveBeenCalledWith('hu')
  })

  it('uses i18next to change language and remembers the explicit selection', async () => {
    const changeLanguage = vi.spyOn(i18n, 'changeLanguage')
    render(<LanguageSwitcher />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to Magyar' }),
    )

    await waitFor(() => {
      const button = screen.getByRole('button', { name: 'Váltás: English' })
      expect(within(button).getByAltText('')).toHaveAttribute(
        'src',
        'https://flagcdn.com/hu.svg',
      )
    })
    expect(changeLanguage).toHaveBeenCalledWith('hu')
    expect(localStorage.getItem('language')).toBe('hu')
    expect(document.documentElement.lang).toBe('hu')
  })
})
