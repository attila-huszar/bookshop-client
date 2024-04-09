import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store/selectors'
import { StyledRecommended, BooksWrapper } from './Recommended.styles'
import { Card } from '../../components'
import { IBook } from '../../interfaces'

export function Recommended() {
  const { booksData } = useAppSelector(booksSelector)

  const randomBooks = (numberOfBooks = 4): IBook[] => {
    const books = new Set<IBook>()

    while (books.size < numberOfBooks) {
      const rndIdx = Math.floor(Math.random() * booksData.length)
      books.add(booksData[rndIdx])
    }

    return [...books]
  }

  return (
    <StyledRecommended>
      <h2>Recommended for you</h2>
      <BooksWrapper>
        {randomBooks().map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </BooksWrapper>
    </StyledRecommended>
  )
}
