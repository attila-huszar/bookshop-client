import { useEffect, useRef } from 'react'
import { booksSelector } from '@/store'
import { InfoDialog, Recommended } from '@/components'
import { useAppSelector } from '@/hooks'
import { News, Releases, TopSellers } from './components'

export function Home() {
  const { booksError } = useAppSelector(booksSelector)
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
        message="Couldn't load the shop. Please try again later."
        error={booksError}
        reloadButton
      />
    </main>
  )
}
