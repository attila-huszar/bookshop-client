import { useEffect, useRef } from 'react'
import { ErrorDialog, StyledHome } from './Home.styles'
import { Recommended, Error } from 'components'
import { Releases } from './components/Releases/Releases'
import { TopSellers } from './components/TopSellers/TopSellers'
import { News } from './components/News/News'
import { useAppSelector } from 'hooks'
import { booksSelector } from 'store'

export function Home() {
  const { booksError } = useAppSelector(booksSelector)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (booksError) {
      dialogRef.current?.showModal()
    }
  }, [booksError])

  return (
    <StyledHome>
      <Releases />
      <TopSellers />
      <Recommended />
      <News />
      <ErrorDialog ref={dialogRef}>
        <Error
          text="Shop failed to load. Please try again later."
          error={booksError}
        />
      </ErrorDialog>
    </StyledHome>
  )
}
