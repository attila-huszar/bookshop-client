import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  NavigationType,
  Outlet,
  useLocation,
  useMatches,
  useNavigationType,
} from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'
import { booksApi } from '@/store/api/booksApi'
import { type pageTitle, parseBookId, ROUTE } from './route'

export function RouteAccessibility() {
  const { t } = useTranslation()
  const { pathname, search } = useLocation()
  const navigationType = useNavigationType()
  const matches = useMatches()
  const bookId =
    matches.at(-1)?.id === ROUTE.BOOK
      ? parseBookId(new URLSearchParams(search).get('id'))
      : null
  const { currentData: book } = booksApi.endpoints.book.useQueryState(
    bookId ?? skipToken,
  )
  const titles = matches.flatMap(({ handle }) => {
    const metadata = handle as ReturnType<typeof pageTitle> | undefined

    return metadata ? [t(metadata.titleKey, { count: metadata.count })] : []
  })
  const title = [...(book ? [book.title] : titles.reverse()), 'Bookshop'].join(
    ' | ',
  )
  const pageKey = bookId ? `${pathname}?id=${bookId}` : pathname
  const previousPage = useRef(pageKey)

  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    if (previousPage.current === pageKey) {
      return
    }

    previousPage.current = pageKey
    const main = document.querySelector('main')
    const activeElement = document.activeElement

    if (
      activeElement instanceof HTMLInputElement &&
      main?.contains(activeElement)
    ) {
      return
    }

    main?.focus({ preventScroll: navigationType === NavigationType.Pop })
  }, [navigationType, pageKey])

  return <Outlet />
}
