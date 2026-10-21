import '@testing-library/jest-dom/vitest'
import React from 'react'
import { waitFor } from '@testing-library/react'
import type { ReadCallback } from 'i18next'
import { vi } from 'vitest'
import { i18n } from './i18n'

globalThis.React = React

beforeAll(async () => {
  await waitFor(() => expect(i18n.isInitialized).toBe(true))

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

// Component tests initialize on import with the public JSON fixtures.
vi.mock('i18next-http-backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('i18next-http-backend')>()
  const { default: en } = await import('../public/locales/en/translation.json')
  const { default: hu } = await import('../public/locales/hu/translation.json')

  class FixtureBackend extends actual.default {
    override read(
      language: string,
      _namespace: string,
      callback: ReadCallback,
    ): void {
      callback(null, language === 'hu' ? hu : en)
    }
  }

  return { ...actual, default: FixtureBackend }
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

vi.mock('@/services/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})
