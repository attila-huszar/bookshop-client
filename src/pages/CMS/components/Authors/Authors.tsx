import { useOutletContext } from 'react-router'
import { cmsAuthorsSelector } from '@/store'
import { Alert, IconButton } from '@/components'
import { useAppSelector } from '@/hooks'
import { CMSOutletContext } from '@/types'
import { EditIcon } from '@/assets/svg'
import { StyledTable } from '../../styles/CMS.style'

export const Authors = () => {
  const { authors, authorsLoading, authorsError } =
    useAppSelector(cmsAuthorsSelector)
  const {
    selectedItems,
    setSelectedItems,
    setIsEditDialogOpen,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()

  if (authorsError) {
    return <Alert message="Error loading authors" error={authorsError} />
  }

  if (!authorsLoading && authors.length === 0) {
    return <Alert message="No authors found" />
  }

  const allSelected =
    authors.length > 0 && selectedItems.authors.length === authors.length

  const sortedAuthors = [...authors].sort((a, b) => {
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
                        authors: [],
                      })
                    : setSelectedItems({
                        ...selectedItems,
                        authors: authors.map((author) => author.id),
                      })
                }
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Birth</th>
            <th>Death</th>
            <th>Born</th>
            <th>Biography</th>
            <th style={{ width: 40, padding: 0 }}></th>
          </tr>
        </thead>
        <tbody>
          {sortedAuthors.map((author) => (
            <tr
              key={author.id}
              onClick={() => {
                setSelectedItems({
                  ...selectedItems,
                  authors: selectedItems.authors.includes(author.id)
                    ? selectedItems.authors.filter((id) => id !== author.id)
                    : [...selectedItems.authors, author.id],
                })
              }}
              className={
                selectedItems.authors.includes(author.id) ? 'selected' : ''
              }>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedItems.authors.includes(author.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => {
                    setSelectedItems((prev) => ({
                      ...prev,
                      authors: prev.authors.includes(author.id)
                        ? prev.authors.filter((id) => id !== author.id)
                        : [...prev.authors, author.id],
                    }))
                  }}
                />
              </td>
              <td>{author.id}</td>
              <td>{author.name}</td>
              <td>{author.birthYear}</td>
              <td>{author.deathYear}</td>
              <td>{author.homeland}</td>
              <td
                style={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  whiteSpace: 'normal',
                  textOverflow: 'ellipsis',
                }}>
                {author.biography}
              </td>
              <td style={{ padding: 0 }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditDialogOpen(true)
                    setEditedItem(author)
                  }}
                  icon={<EditIcon />}
                  $size="sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </StyledTable>
  )
}
