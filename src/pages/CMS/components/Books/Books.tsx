import { useOutletContext } from 'react-router'
import { cmsAuthorsSelector, cmsBooksSelector } from '@/store'
import { Alert, IconButton } from '@/components'
import { useAppSelector } from '@/hooks'
import { CMSOutletContext } from '@/types'
import { EditIcon, imagePlaceholder } from '@/assets/svg'
import { StyledTable } from '../../styles/CMS.style'

export const Books = () => {
  const { books, booksLoading, booksError } = useAppSelector(cmsBooksSelector)
  const { authors } = useAppSelector(cmsAuthorsSelector)
  const {
    selectedItems,
    setSelectedItems,
    setIsEditDialogOpen,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()

  if (booksError) {
    return <Alert message="Error loading books" error={booksError} />
  }

  if (!booksLoading && books.length === 0) {
    return <Alert message="No books found" />
  }

  const allSelected =
    books.length > 0 && selectedItems.books.length === books.length

  const sortedBooks = [...books].sort((a, b) => {
    if (a.id === undefined || b.id === undefined) return 0
    return a.id - b.id
  })

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
            <th style={{ width: 40, padding: 0 }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedBooks.map((book) => {
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
                <td style={{ padding: 0 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditDialogOpen(true)
                      setEditedItem(book)
                    }}
                    icon={<EditIcon />}
                    $iconSize="sm"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
