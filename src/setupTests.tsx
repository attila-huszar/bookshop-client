import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'
import { i18n } from './i18n'

globalThis.React = React

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})

beforeEach(async () => {
  await i18n.changeLanguage('en')
})

vi.mock('react-hot-toast', () => ({
  toast: Object.assign(
    vi.fn(() => ''),
    {
      error: vi.fn(),
      success: vi.fn(),
      loading: vi.fn(),
      custom: vi.fn(),
      promise: vi.fn(),
    },
  ),
  Toaster: () => null,
  useToasterStore: () => ({ toasts: [] }),
}))

vi.mock('@/api/logs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/logs')>()),
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

window.matchMedia = (query) => {
  const [, rangeMin, rangeMax] =
    /^\((\d+)px <= width < (\d+)px\)$/.exec(query) ?? []
  const minWidth = rangeMin ?? /^\(width >= (\d+)px\)$/.exec(query)?.[1]
  const maxWidth = rangeMax ?? /^\(width < (\d+)px\)$/.exec(query)?.[1]
  const isWidthQuery = minWidth !== undefined || maxWidth !== undefined
  const matchesMin =
    minWidth === undefined || window.innerWidth >= Number(minWidth)
  const matchesMax =
    maxWidth === undefined || window.innerWidth < Number(maxWidth)

  return Object.assign(new EventTarget(), {
    media: query,
    matches: isWidthQuery
      ? matchesMin && matchesMax
      : query === '(prefers-reduced-motion: no-preference)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })
}

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
})
