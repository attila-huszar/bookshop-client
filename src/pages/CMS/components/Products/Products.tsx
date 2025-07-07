import { useEffect, useState } from 'react'
import { StyledTable } from '../Tabs/Tabs.style'
import { fetchAllBooks } from '@/store'
import { useAppDispatch } from '@/hooks'
import type { Book } from '@/types'

type BookWithAuthor = Omit<Book, 'author'> & { author: string }

export const Products = () => {
  const dispatch = useAppDispatch()
  const [books, setBooks] = useState<BookWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    dispatch(fetchAllBooks())
      .unwrap()
      .then(setBooks)
      .catch((err) =>
        setError(typeof err === 'string' ? err : 'Failed to fetch books'),
      )
      .finally(() => setLoading(false))
  }, [dispatch])

  return (
    <StyledTable>
      {loading && <p>Loading users...</p>}
      {error && <p>{error}</p>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Author</th>
              <th>Title</th>
              <th>Genre</th>
              <th>Price</th>
              <th>Discount (%)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.imgUrl && <img src={book.imgUrl} height={32} />}</td>
                <td>{book.author}</td>
                <td>{book.title}</td>
                <td>{book.genre}</td>
                <td>{book.price}</td>
                <td>{book.discount}</td>
                <td>{book.discountPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </StyledTable>
  )
}
