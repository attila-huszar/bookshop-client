import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { homeBooksErrorSelector } from '@/store/selectors'
import { InfoDialog } from '@/components/InfoDialog'
import { Recommended } from '@/components/Recommended'
import { useAppSelector } from '@/hooks/redux'
import { News, Releases, TopSellers } from './components'

export function Home() {
  const { t } = useTranslation()

  const booksError = useAppSelector(homeBooksErrorSelector)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (booksError) {
      ref.current?.showModal()
    }
  }, [booksError])

  return (
    <main>
      <Releases />
      <TopSellers />
      <Recommended />
      <News />
      <InfoDialog
        dialogRef={ref}
        message={t('home.error')}
        error={booksError}
        reloadButton
        dismissible
      />
    </main>
  )
}
