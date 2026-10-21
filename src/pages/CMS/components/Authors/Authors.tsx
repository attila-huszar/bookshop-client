import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { cmsAuthorsSelector } from '@/store/selectors'
import { Alert } from '@/components/Alert'
import { IconButton } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { useAppSelector } from '@/hooks/redux'
import { CMSOutletContext } from '@/types'
import { EditIcon } from '@/assets/svg'
import { StyledTable, TableActions } from '../../styles/CMS.style'

export const Authors = () => {
  const { t } = useTranslation()

  const { authors, authorsLoading, authorsError } =
    useAppSelector(cmsAuthorsSelector)
  const {
    selectedItems,
    setSelectedItems,
    setIsDialogOpen,
    setIsEditing,
    setEditedItem,
  } = useOutletContext<CMSOutletContext>()

  if (authorsLoading) {
    return <Loading message={t('cms.authorsLoading')} fullScreen />
  }

  if (authorsError) {
    return <Alert message={t('cms.authorsError')} error={authorsError} />
  }

  if (authors.length === 0) {
    return <Alert message={t('cms.authorsEmpty')} />
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
                aria-label={t('common.selectAll')}
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
            <th>{t('common.fields.id')}</th>
            <th>{t('common.fields.name')}</th>
            <th>{t('common.fields.birth')}</th>
            <th>{t('common.fields.death')}</th>
            <th>{t('common.fields.homeland')}</th>
            <th>{t('common.fields.biography')}</th>
            <th className="actions">{t('common.fields.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedAuthors.map((author) => (
            <tr
              key={author.id}
              onClick={() => {
                setIsEditing(false)
                setEditedItem(author)
                setIsDialogOpen(true)
              }}
              className={
                selectedItems.authors.includes(author.id) ? 'selected' : ''
              }>
              <td
                style={{ textAlign: 'center' }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedItems((prev) => ({
                    ...prev,
                    authors: prev.authors.includes(author.id)
                      ? prev.authors.filter((id) => id !== author.id)
                      : [...prev.authors, author.id],
                  }))
                }}>
                <input
                  type="checkbox"
                  aria-label={t('cms.selectRecord', {
                    entity: t('common.fields.author').toLocaleLowerCase(),
                    id: author.id,
                  })}
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
              <td className="actions">
                <TableActions>
                  <IconButton
                    type="button"
                    title={t('cms.edit', {
                      entity: t('common.fields.author').toLocaleLowerCase(),
                    })}
                    aria-label={t('cms.editRecord', {
                      entity: t('common.fields.author').toLocaleLowerCase(),
                      id: author.id,
                    })}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditing(true)
                      setIsDialogOpen(true)
                      setEditedItem(author)
                    }}
                    icon={<EditIcon aria-hidden="true" />}
                    $size="sm"
                  />
                </TableActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </StyledTable>
  )
}
