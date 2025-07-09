import { useState } from 'react'
import { StyledTable } from '../Tabs/Tabs.style'
import { InfoDialog } from '@/components'
import { cmsAuthorsSelector, cmsBooksSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { imagePlaceholder } from '@/assets/svg'

export const Books = () => {
  const { books, booksIsLoading, booksError } = useAppSelector(cmsBooksSelector)
  const { authors } = useAppSelector(cmsAuthorsSelector)
  const [selectedBooks, setSelectedBooks] = useState<number[]>([])

  if (booksIsLoading) {
    return <InfoDialog message="Loading books..." />
  }

  if (booksError) {
    return <InfoDialog message="Error loading books" error={booksError} />
  }

  const allSelected = books.length > 0 && selectedBooks.length === books.length

  return (
    <StyledTable>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  allSelected
                    ? setSelectedBooks([])
                    : setSelectedBooks(books.map((book) => book.id))
                }
              />
            </th>
            <th>ID</th>
            <th>Cover</th>
            <th>Author</th>
            <th>Title</th>
            <th>Genre</th>
            <th>Price</th>
            <th>-%</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            const author =
              authors.find((author) => author.id === book.authorId)?.name ??
              'Unknown Author'

            return (
              <tr
                key={book.id}
                onClick={() => {
                  setSelectedBooks((prev) =>
                    prev.includes(book.id)
                      ? prev.filter((id) => id !== book.id)
                      : [...prev, book.id],
                  )
                }}
                className={selectedBooks.includes(book.id) ? 'selected' : ''}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      setSelectedBooks((prev) =>
                        prev.includes(book.id)
                          ? prev.filter((id) => id !== book.id)
                          : [...prev, book.id],
                      )
                    }}
                  />
                </td>
                <td>{book.id}</td>
                <td style={{ textAlign: 'center' }}>
                  {book.imgUrl && (
                    <img
                      src={book.imgUrl}
                      onError={(e) => {
                        const target = e.currentTarget
                        target.src = imagePlaceholder
                      }}
                      alt={book.title}
                      height={32}
                    />
                  )}
                </td>
                <td>{author}</td>
                <td>{book.title}</td>
                <td>{book.genre}</td>
                <td>{book.price}</td>
                <td>{book.discount}</td>
                <td>{book.discountPrice}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
