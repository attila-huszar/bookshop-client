import { useOutletContext } from 'react-router'
import { StyledTable } from '../Tabs/Tabs.style'
import { Error } from '@/components'
import { cmsAuthorsSelector, cmsBooksSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { CMSContext } from '../../CMS.types'
import { imagePlaceholder } from '@/assets/svg'

export const Books = () => {
  const { books, booksError } = useAppSelector(cmsBooksSelector)
  const { authors } = useAppSelector(cmsAuthorsSelector)
  const { selectedItems, setSelectedItems } = useOutletContext<{
    selectedItems: CMSContext
    setSelectedItems: React.Dispatch<React.SetStateAction<CMSContext>>
  }>()

  if (booksError) {
    return <Error message="Error loading books" error={booksError} />
  }

  const allSelected =
    books.length > 0 && selectedItems.books.length === books.length

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
                    ? setSelectedItems({
                        ...selectedItems,
                        books: [],
                      })
                    : setSelectedItems({
                        ...selectedItems,
                        books: books.map((book) => book.id),
                      })
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
                  setSelectedItems((prev) => ({
                    ...prev,
                    books: prev.books.includes(book.id)
                      ? prev.books.filter((id) => id !== book.id)
                      : [...prev.books, book.id],
                  }))
                }}
                className={
                  selectedItems.books.includes(book.id) ? 'selected' : ''
                }>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.books.includes(book.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      setSelectedItems((prev) => ({
                        ...prev,
                        books: prev.books.includes(book.id)
                          ? prev.books.filter((id) => id !== book.id)
                          : [...prev.books, book.id],
                      }))
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
