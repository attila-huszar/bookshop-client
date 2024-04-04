import { useNavigate } from 'react-router-dom'
import { StyledNotFound } from './NotFound.styles'

export function NotFound() {
  const navigate = useNavigate()

  function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    hasPreviousPage ? navigate(-1) : navigate('/')
  }

  return (
    <StyledNotFound>
      <button onClick={handleGoBack}>404</button>
    </StyledNotFound>
  )
}
