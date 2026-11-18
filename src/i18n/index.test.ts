import { createElement, Suspense } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Links } from '@/components/Footer/components/Links/Links'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import en from './locales/en.json'
import hu from './locales/hu.json'

let translations: typeof import('./index')
function TermsTitle() {
  const { t } = useTranslation('translation', { i18n: translations.i18n })

  return createElement('p', null, t('terms.title'))
}

async function importTranslations(): Promise<void> {
  translations = await import('./index')
  expect(translations.i18n.isInitialized).toBe(true)
}

beforeEach(() => {
  vi.resetModules()
  vi.doUnmock('@/routes/Routes')
  localStorage.removeItem('language')
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
})

describe('bundled translations', () => {
  it('renders the app in the browser language on the first render', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['hu-HU'])
    await importTranslations()
    vi.doMock('@/routes/Routes', () => ({
      Routes: () =>
        createElement(
          'main',
          null,
          createElement('h1', null, 'Book catalogue'),
          createElement(
            Suspense,
            { fallback: createElement('p', null, 'Page loading') },
            createElement(LanguageSwitcher),
            createElement(Links),
          ),
        ),
    }))
    const { default: App } = await import('../App')
    const { createAppStore } = await import('../store/store')
    render(
      createElement(
        I18nextProvider,
        { i18n: translations.i18n },
        createElement(
          Provider,
          { store: createAppStore(), children: null },
          createElement(App),
        ),
      ),
    )

    expect(screen.getByRole('group', { name: hu.language.label })).toBeVisible()
    expect(screen.getByRole('link', { name: hu.terms.title })).toHaveAttribute(
      'href',
      '/terms',
    )
    expect(
      screen.queryByRole('link', { name: 'Terms and Conditions' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: hu.navigation.privacy }),
    ).toBeVisible()
    expect(screen.getByAltText('Google')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Book catalogue' }),
    ).toBeVisible()
  })

  it('switches between both languages without fetching', async () => {
    const request = vi.spyOn(globalThis, 'fetch')
    await importTranslations()

    expect(translations.i18n.t('terms.title')).toBe(en.terms.title)

    await translations.i18n.changeLanguage('hu')

    expect(translations.i18n.t('terms.title')).toBe(hu.terms.title)
    expect(document.documentElement.lang).toBe('hu')
    expect(localStorage.getItem('language')).toBeNull()

    await translations.i18n.changeLanguage('en')

    expect(translations.i18n.t('terms.title')).toBe(en.terms.title)
    expect(document.documentElement.lang).toBe('en')
    expect(request).not.toHaveBeenCalled()
  })

  it('loads the saved Hungarian preference and English fallback at startup', async () => {
    localStorage.setItem('language', 'hu')
    await importTranslations()

    expect(translations.i18n.resolvedLanguage).toBe('hu')
    expect(
      translations.i18n.t('terms.orderButton', {
        amount: '12.00',
        currency: 'EUR',
      }),
    ).toContain('Megrendelés és fizetés')
  })

  it('uses saved English even when the browser prefers Hungarian', async () => {
    localStorage.setItem('language', 'en')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['hu-HU'])
    await importTranslations()

    expect(translations.i18n.resolvedLanguage).toBe('en')
    expect(localStorage.getItem('language')).toBe('en')
  })

  it.each([
    { languages: ['de-DE', 'hu-HU', 'en-GB'], expected: 'hu' },
    { languages: ['fr-FR', 'en-GB', 'hu-HU'], expected: 'en' },
    { languages: ['HU-hu'], expected: 'hu' },
    { languages: ['de-DE', 'fr-FR'], expected: 'en' },
  ])(
    'selects $expected from browser preferences $languages without saving it as an explicit choice',
    async ({ languages, expected }) => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)
      await importTranslations()

      expect(translations.i18n.resolvedLanguage).toBe(expected)
      expect(document.documentElement.lang).toBe(expected)
      expect(translations.i18n.t('terms.title')).toBe(
        expected === 'hu' ? hu.terms.title : en.terms.title,
      )
      expect(localStorage.getItem('language')).toBeNull()
    },
  )

  it('uses navigator.language when the browser language list is empty', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([])
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('hu-HU')
    await importTranslations()

    expect(translations.i18n.resolvedLanguage).toBe('hu')
    expect(document.documentElement.lang).toBe('hu')
  })

  it.each(['de', '{"language":"hu"}'])(
    'ignores an invalid saved language %s and detects the browser language',
    async (stored) => {
      localStorage.setItem('language', stored)
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['hu-HU'])
      await importTranslations()

      expect(translations.i18n.resolvedLanguage).toBe('hu')
    },
  )

  it('detects browser language and allows switching when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['hu-HU'])
    await importTranslations()

    expect(translations.i18n.resolvedLanguage).toBe('hu')
    render(
      createElement(
        I18nextProvider,
        { i18n: translations.i18n },
        createElement(LanguageSwitcher),
      ),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Váltás: English' }),
    )

    expect(translations.i18n.resolvedLanguage).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('cross-tab language preferences', () => {
  let stop: (() => void) | undefined

  afterEach(() => {
    stop?.()
    stop = undefined
  })

  function notifyLanguageChange(storageArea = localStorage, key = 'language') {
    window.dispatchEvent(new StorageEvent('storage', { storageArea, key }))
  }

  it('adopts the current saved preference and updates mounted content without writing it back', async () => {
    await importTranslations()
    stop = translations.listenForLanguageChanges()
    render(createElement(TermsTitle))
    localStorage.setItem('language', 'hu')
    const save = vi.spyOn(Storage.prototype, 'setItem')

    await act(async () => {
      const changed = new Promise<void>((resolve) => {
        translations.i18n.once('languageChanged', () => resolve())
      })

      // The stored value is authoritative, even if an older event was queued.
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: localStorage,
          key: 'language',
          newValue: 'en',
        }),
      )
      await changed
    })

    expect(await screen.findByText(hu.terms.title)).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('hu')
    expect(save).not.toHaveBeenCalled()
  })

  it('ignores unrelated storage events and invalid saved languages', async () => {
    await importTranslations()
    stop = translations.listenForLanguageChanges()
    const change = vi.spyOn(translations.i18n, 'changeLanguage')
    localStorage.setItem('language', 'hu')
    notifyLanguageChange(sessionStorage)
    notifyLanguageChange(localStorage, 'cart')
    localStorage.setItem('language', '{"language":"hu"}')
    notifyLanguageChange()

    expect(change).not.toHaveBeenCalled()
    expect(translations.i18n.resolvedLanguage).toBe('en')
  })

  it('catches missed preferences when a tab becomes visible', async () => {
    await importTranslations()
    stop = translations.listenForLanguageChanges()
    localStorage.setItem('language', 'hu')
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    expect(translations.i18n.resolvedLanguage).toBe('en')

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    document.dispatchEvent(new Event('visibilitychange'))

    await waitFor(() => expect(translations.i18n.resolvedLanguage).toBe('hu'))
  })

  it('stops updating the language after cleanup', async () => {
    await importTranslations()
    stop = translations.listenForLanguageChanges()
    stop()

    localStorage.setItem('language', 'hu')
    notifyLanguageChange()
    window.dispatchEvent(new Event('focus'))

    expect(translations.i18n.resolvedLanguage).toBe('en')
  })
})

describe('Locize translations', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_LOCIZE_PROJECT_ID', 'bookshop-test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders bundled text first and applies published updates to the active language', async () => {
    let respond!: (response: Response) => void
    const request = vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve
        }),
    )
    request.mockResolvedValue(Response.json({}))
    await importTranslations()
    render(createElement(TermsTitle))

    expect(screen.getByText(en.terms.title)).toBeVisible()
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
    expect(request).toHaveBeenCalledWith(
      'https://api.lite.locize.app/bookshop-test/latest/en/translation',
      expect.objectContaining({ method: 'GET' }),
    )

    respond(Response.json({ terms: { title: 'Published terms' } }))

    expect(await screen.findByText('Published terms')).toBeVisible()
    expect(
      translations.i18n.t('terms.orderButton', {
        amount: '10',
        currency: 'EUR',
      }),
    ).toContain('10')

    await act(async () => {
      await translations.i18n.changeLanguage('hu')
    })

    expect(screen.getByText(hu.terms.title)).toBeVisible()
    expect(request).toHaveBeenCalledWith(
      'https://api.lite.locize.app/bookshop-test/latest/hu/translation',
      expect.objectContaining({ method: 'GET' }),
    )

    await act(async () => {
      await translations.i18n.changeLanguage('en')
    })

    expect(screen.getByText('Published terms')).toBeVisible()
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('keeps bundled text when the CDN request fails', async () => {
    const request = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new TypeError('Failed to fetch'))
    await importTranslations()
    render(createElement(TermsTitle))

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        'https://api.lite.locize.app/bookshop-test/latest/en/translation',
        expect.objectContaining({ method: 'GET' }),
      ),
    )
    expect(screen.getByText(en.terms.title)).toBeVisible()
  })
})
