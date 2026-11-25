import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { homeBooksErrorSelector } from '@/store/selectors'
import { InfoDialog } from '@/components/InfoDialog'
import { Recommended } from '@/components/Recommended'
import { useAppSelector } from '@/hooks/redux'
import { News, Releases, TopSellers } from './components'

export function Home() {
  const { t } = useTranslation()

  const isRestoring = useAppSelector((state) => state.auth.isRestoring)
  const booksError = useAppSelector(homeBooksErrorSelector)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (booksError) {
      ref.current?.showModal()
    }
  }, [booksError])

  return (
    <>
      <Releases skipQuery={isRestoring} />
      <TopSellers skipQuery={isRestoring} />
      <Recommended skipQuery={isRestoring} />
      <News skipQuery={isRestoring} />
      <InfoDialog
        dialogRef={ref}
        message={t('home.error')}
        error={booksError}
        reloadButton
        dismissible
      />
    </>
  )
}
