import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { useCmsAuthorsQuery, useCmsBooksQuery } from '@/store/api/bookshopApi'
import { Alert } from '@/components/Alert'
import { IconButton } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { CMSOutletContext } from '@/types'
import { EditIcon, imagePlaceholder } from '@/assets/svg'
import { StyledTable, TableActions } from '../../styles/CMS.style'

export const Books = () => {
  const { t } = useTranslation()

  const {
    data: books = [],
    isLoading: booksLoading,
    error: booksError,
  } = useCmsBooksQuery()
  const { data: authors = [] } = useCmsAuthorsQuery()
  const {
    selectedItems,
    setSelectedItems,
    setIsDialogOpen,
    setIsEditing,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()

  if (booksLoading) {
    return <Loading message={t('catalogue.loading')} fullScreen />
  }

  if (booksError) {
    return <Alert message={t('catalogue.error')} error={booksError} />
  }

  if (books.length === 0) {
    return <Alert message={t('catalogue.empty')} />
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
                aria-label={t('common.selectAll')}
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
            <th>{t('common.fields.id')}</th>
            <th>{t('common.fields.cover')}</th>
            <th>{t('common.fields.author')}</th>
            <th>{t('common.fields.title')}</th>
            <th>{t('common.fields.genre')}</th>
            <th>{t('common.fields.price')}</th>
            <th>-%</th>
            <th>{t('common.fields.total')}</th>
            <th className="actions">{t('common.fields.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedBooks.map((book) => {
            const author =
              authors.find((author) => author.id === book.authorId)?.name ??
              t('common.unknownAuthor')

            return (
              <tr
                key={book.id}
                onClick={() => {
                  setIsEditing(false)
                  setEditedItem(book)
                  setIsDialogOpen(true)
                }}
                className={
                  selectedItems.books.includes(book.id) ? 'selected' : ''
                }>
                <td
                  style={{ textAlign: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItems((prev) => ({
                      ...prev,
                      books: prev.books.includes(book.id)
                        ? prev.books.filter((id) => id !== book.id)
                        : [...prev.books, book.id],
                    }))
                  }}>
                  <input
                    type="checkbox"
                    aria-label={t('cms.selectRecord', {
                      entity: t('catalogue.book').toLocaleLowerCase(),
                      id: book.id,
                    })}
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
                <td className="actions">
                  <TableActions>
                    <IconButton
                      type="button"
                      title={t('cms.edit', {
                        entity: t('catalogue.book').toLocaleLowerCase(),
                      })}
                      aria-label={t('cms.editRecord', {
                        entity: t('catalogue.book').toLocaleLowerCase(),
                        id: book.id,
                      })}
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditing(true)
                        setIsDialogOpen(true)
                        setEditedItem(book)
                      }}
                      icon={<EditIcon aria-hidden="true" />}
                      $size="sm"
                    />
                  </TableActions>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </StyledTable>
  )
}
