import { StyledTable } from '../Tabs/Tabs.style'
import { InfoDialog } from '@/components'
import { cmsAuthorsSelector } from '@/store'
import { useAppSelector } from '@/hooks'

export const Authors = () => {
  const { authors, authorsIsLoading, authorsError } =
    useAppSelector(cmsAuthorsSelector)

  if (authorsIsLoading) {
    return <InfoDialog message="Loading authors..." />
  }

  if (authorsError) {
    return <InfoDialog message="Error loading authors" error={authorsError} />
  }

  return (
    <StyledTable>
      <table>
        <thead>
          <tr>
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
            <tr key={author.id}>
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
