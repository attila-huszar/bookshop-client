import { useEffect } from 'react'
import { useOutletContext } from 'react-router'
import { setCmsCurrentPage } from '@/store/slices/cms'
import type { CMSOutletContext, SelectContext } from '@/types'
import { useAppDispatch, useAppSelector } from './redux'

export function useCmsPagination(tab: keyof SelectContext, total: number) {
  const dispatch = useAppDispatch()
  const { currentPages, itemsPerPage } = useAppSelector((state) => state.cms)
  const { setSelectedItems } = useOutletContext<CMSOutletContext>()
  const selectedPage = currentPages[tab]
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))
  const currentPage = Math.min(selectedPage, totalPages)

  useEffect(() => {
    if (selectedPage !== currentPage) {
      dispatch(setCmsCurrentPage({ tab, page: currentPage }))
      setSelectedItems((previous) => ({ ...previous, [tab]: [] }))
    }
  }, [currentPage, dispatch, selectedPage, setSelectedItems, tab])

  const onPageChange = (page: number) => {
    dispatch(setCmsCurrentPage({ tab, page }))
    setSelectedItems((previous) => ({ ...previous, [tab]: [] }))
  }

  return {
    currentPage,
    itemsPerPage,
    pageStart: (currentPage - 1) * itemsPerPage,
    onPageChange,
  }
}
