import { createElement, Suspense } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { Provider } from 'react-redux'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { log } from '@/api/logs'
import { Links } from '@/components/Footer/components/Links/Links'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import en from '../../public/locales/en/translation.json'
import hu from '../../public/locales/hu/translation.json'

let translations: typeof import('./index')
const fetchTranslations =
  vi.fn<(url: string, options: RequestInit) => Promise<Response>>()

function jsonResponse(language: 'en' | 'hu'): Response {
  return new Response(JSON.stringify(language === 'en' ? en : hu), {
    headers: { 'content-type': 'application/json' },
  })
}

function TermsTitle() {
  const { t } = useTranslation('translation', { i18n: translations.i18n })

  return createElement('p', null, t('terms.title'))
}

async function importTranslations(): Promise<void> {
  translations = await import('./index')
  await waitFor(() => expect(translations.i18n.isInitialized).toBe(true))
}

beforeEach(() => {
  vi.resetModules()
  vi.doUnmock('@/routes/Routes')
  localStorage.removeItem('language')
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
  fetchTranslations
    .mockReset()
    .mockImplementation((url) =>
      Promise.resolve(jsonResponse(url.includes('/hu/') ? 'hu' : 'en')),
    )
  vi.doMock('i18next-http-backend', async () => {
    const actual = await vi.importActual<typeof import('i18next-http-backend')>(
      'i18next-http-backend',
    )

    class MockFetchBackend extends actual.default {
      constructor() {
        super(undefined, {
          alternateFetch: (url, options) => fetchTranslations(url, options),
          reloadInterval: false,
        })
      }
    }

    return { ...actual, default: MockFetchBackend }
  })
})

describe('HTTP translation loading', () => {
  it('waits for translations before showing the app, including pages with their own loading boundary', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['hu-HU'])
    const pendingLoads: (() => void)[] = []
    fetchTranslations.mockImplementation(
      (url) =>
        new Promise<Response>((resolve) => {
          pendingLoads.push(() =>
            resolve(jsonResponse(url.includes('/hu/') ? 'hu' : 'en')),
          )
        }),
    )
    translations = await import('./index')
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
    const { container } = render(
      createElement(
        I18nextProvider,
        { i18n: translations.i18n },
        createElement(
          Provider,
          { store: createAppStore(), children: null },
          createElement(Suspense, { fallback: null }, createElement(App)),
        ),
      ),
    )

    expect(container).toBeEmptyDOMElement()
    await waitFor(() => expect(fetchTranslations).toHaveBeenCalledTimes(2))
    await act(async () => {
      const initialized = new Promise<void>((resolve) => {
        translations.i18n.on('initialized', () => resolve())
      })

      for (const completeLoad of pendingLoads) {
        completeLoad()
      }

      await initialized
    })

    expect(
      await screen.findByRole('group', { name: hu.language.label }),
    ).toBeVisible()
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

  it('uses Suspense while startup translations load and then renders translated content', async () => {
    let completeLoad: () => void = vi.fn()
    fetchTranslations.mockImplementation((url) =>
      url.includes('/hu/')
        ? Promise.resolve(jsonResponse('hu'))
        : new Promise<Response>((resolve) => {
            completeLoad = () => resolve(jsonResponse('en'))
          }),
    )
    translations = await import('./index')
    render(
      createElement(
        Suspense,
        { fallback: createElement('p', null, 'Loading') },
        createElement(TermsTitle),
      ),
    )

    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.queryByText('terms.title')).not.toBeInTheDocument()
    await waitFor(() => expect(fetchTranslations).toHaveBeenCalledTimes(2))
    await act(async () => {
      const initialized = new Promise<void>((resolve) => {
        translations.i18n.on('initialized', () => resolve())
      })
      completeLoad()
      await initialized
    })

    expect(await screen.findByText(en.terms.title)).toBeInTheDocument()
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('preloads both languages at startup and switches without fetching again', async () => {
    await importTranslations()
    expect((await import('./index')).i18n).toBe(translations.i18n)

    expect(fetchTranslations).toHaveBeenCalledTimes(2)
    expect(fetchTranslations).toHaveBeenCalledWith(
      '/locales/en/translation.json',
      expect.objectContaining({ cache: 'no-cache' }),
    )
    expect(translations.i18n.t('terms.title')).toBe(en.terms.title)
    expect(translations.i18n.hasResourceBundle('hu', 'translation')).toBe(true)
    expect(localStorage.getItem('language')).toBeNull()

    await translations.i18n.changeLanguage('hu')
    expect(fetchTranslations).toHaveBeenCalledTimes(2)
    expect(translations.i18n.t('terms.title')).toBe(hu.terms.title)
    expect(document.documentElement.lang).toBe('hu')
    expect(localStorage.getItem('language')).toBeNull()

    await translations.i18n.changeLanguage('en')
    await translations.i18n.changeLanguage('hu')
    expect(fetchTranslations).toHaveBeenCalledTimes(2)
  })

  it('loads the saved Hungarian preference and English fallback at startup', async () => {
    localStorage.setItem('language', 'hu')
    await importTranslations()

    expect(fetchTranslations).toHaveBeenCalledTimes(2)
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
    expect(fetchTranslations).toHaveBeenCalledTimes(2)
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

  it('falls back to English if saved Hungarian cannot be loaded', async () => {
    localStorage.setItem('language', 'hu')
    fetchTranslations.mockImplementation((url) =>
      Promise.resolve(
        url.includes('/hu/')
          ? new Response('Unavailable', { status: 503 })
          : jsonResponse('en'),
      ),
    )
    await importTranslations()

    expect(translations.i18n.resolvedLanguage).toBe('en')
    expect(translations.i18n.t('terms.title')).toBe(en.terms.title)
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('language')).toBe('hu')
  })

  it('logs startup failures when English is unavailable', async () => {
    const logError = vi.spyOn(log, 'error')
    fetchTranslations.mockResolvedValue(
      new Response('Missing', { status: 404 }),
    )

    await importTranslations()

    expect(translations.i18n.hasResourceBundle('en', 'translation')).toBe(false)
    expect(logError).toHaveBeenCalledWith(
      'Unable to initialize translations',
      expect.anything(),
    )
  })

  it.each([404, 503])(
    'uses the English fallback after HTTP %s without saving the unavailable language',
    async (status) => {
      fetchTranslations.mockImplementation((url) =>
        Promise.resolve(
          url.includes('/hu/')
            ? new Response('Unavailable', { status })
            : jsonResponse(url.includes('/hu/') ? 'hu' : 'en'),
        ),
      )
      await importTranslations()

      render(
        createElement(
          I18nextProvider,
          { i18n: translations.i18n },
          createElement(LanguageSwitcher),
        ),
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Switch to Magyar' }),
      )

      expect(await screen.findByRole('alert')).toHaveTextContent(
        en.language.loadError,
      )
      expect(translations.i18n.resolvedLanguage).toBe('en')
      expect(localStorage.getItem('language')).toBeNull()
    },
  )
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
    expect(fetchTranslations).toHaveBeenCalledTimes(2)
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

  it('keeps the active language when the other language cannot be loaded', async () => {
    fetchTranslations.mockImplementation((url) =>
      Promise.resolve(
        url.includes('/hu/')
          ? new Response('Missing', { status: 404 })
          : jsonResponse('en'),
      ),
    )
    await importTranslations()
    stop = translations.listenForLanguageChanges()
    localStorage.setItem('language', 'hu')
    const loaded = vi.spyOn(translations.i18n, 'loadLanguages')
    notifyLanguageChange()
    await loaded.mock.results[0]?.value

    expect(translations.i18n.resolvedLanguage).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('language')).toBe('hu')
  })

  it('ignores an obsolete preference while loading and stops pending synchronization on cleanup', async () => {
    await importTranslations()
    let finish!: () => void
    const pending = new Promise<void>((resolve) => {
      finish = resolve
    })
    const load = vi
      .spyOn(translations.i18n, 'loadLanguages')
      .mockReturnValue(pending)
    const change = vi.spyOn(translations.i18n, 'changeLanguage')
    stop = translations.listenForLanguageChanges()
    localStorage.setItem('language', 'hu')
    notifyLanguageChange()
    localStorage.setItem('language', 'en')
    finish()
    await pending

    expect(change).not.toHaveBeenCalled()

    const next = new Promise<void>((resolve) => {
      finish = resolve
    })
    load.mockReturnValue(next)
    localStorage.setItem('language', 'hu')
    notifyLanguageChange()
    stop()
    stop = undefined
    finish()
    await next
    window.dispatchEvent(new Event('focus'))

    expect(change).not.toHaveBeenCalled()
  })
})
