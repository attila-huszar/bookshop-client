import { useOutletContext } from 'react-router'
import { StyledTable } from '../Tabs/Tabs.style'
import { Error } from '@/components'
import { cmsAuthorsSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { CMSContext } from '../../CMS.types'

export const Authors = () => {
  const { authors, authorsError } = useAppSelector(cmsAuthorsSelector)
  const { selectedItems, setSelectedItems } = useOutletContext<{
    selectedItems: CMSContext
    setSelectedItems: React.Dispatch<React.SetStateAction<CMSContext>>
  }>()

  if (authorsError) {
    return <Error message="Error loading authors" error={authorsError} />
  }

  if (authors.length === 0) {
    return <Error message="No authors found" />
  }

  const allSelected =
    authors.length > 0 && selectedItems.authors.length === authors.length

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
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
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
              <td>{author.biography}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </StyledTable>
  )
}
