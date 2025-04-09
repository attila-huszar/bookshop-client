import { useNavigate } from 'react-router'
import {
  BackButton,
  ImageWrapper,
  NotFoundSection,
  StyledNotFound,
} from './NotFound.style'
import books from '@/assets/image/books.png'

export function NotFound() {
  const navigate = useNavigate()

  async function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    if (hasPreviousPage) {
      await navigate(-1)
    } else {
      await navigate('/')
    }
  }

  return (
    <StyledNotFound>
      <ImageWrapper>
        <img src={books} alt="books" />
      </ImageWrapper>
      <NotFoundSection>
        <h2>404</h2>
        <h3>{"Looks like you've got lost..."}</h3>
        <h4>
          {"The page you're looking for doesn't exist or has been moved."}
        </h4>
      </NotFoundSection>
      <BackButton type="button" onClick={() => void handleGoBack()}>
        Go Back
      </BackButton>
    </StyledNotFound>
  )
}
