import { StyledTable } from '../Tabs/Tabs.style'
import { InfoDialog } from '@/components'
import { cmsAuthorsSelector, cmsBooksSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { imagePlaceholder } from '@/assets/svg'

export const Books = () => {
  const { books, booksIsLoading, booksError } = useAppSelector(cmsBooksSelector)
  const { authors } = useAppSelector(cmsAuthorsSelector)

  if (booksIsLoading) {
    return <InfoDialog message="Loading books..." />
  }

  if (booksError) {
    return <InfoDialog message="Error loading books" error={booksError} />
  }

  return (
    <StyledTable>
      <table>
        <thead>
          <tr>
            <th>ID</th>
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
          {books.map((book) => {
            const author =
              authors.find((author) => author.id === book.authorId)?.name ??
              'Unknown Author'

            return (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>
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
