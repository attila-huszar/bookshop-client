import { useEffect, useRef } from 'react'
import { Recommended } from '@/components/Recommended/Recommended'
import { InfoDialog } from '@/components/InfoDialog/InfoDialog'
import { Releases } from './components/Releases/Releases'
import { TopSellers } from './components/TopSellers/TopSellers'
import { News } from './components/News/News'
import { useAppSelector } from '@/hooks'
import { booksSelector } from '@/store'

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
