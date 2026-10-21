import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import books from '@/assets/image/books.png'
import {
  BackButton,
  ImageWrapper,
  NotFoundSection,
  StyledNotFound,
} from './NotFound.style'

export function NotFound() {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const handleGoBack = () => {
    const hasPreviousPage = window.history.length > 2
    if (hasPreviousPage) {
      void navigate(-1)
    } else {
      void navigate('/')
    }
  }

  return (
    <StyledNotFound>
      <ImageWrapper>
        <img src={books} alt="" />
      </ImageWrapper>
      <NotFoundSection>
        <h2>404</h2>
        <h3>{t('notFound.title')}</h3>
        <h4>{t('notFound.description')}</h4>
      </NotFoundSection>
      <BackButton type="button" onClick={handleGoBack}>
        {t('common.actions.goBack')}
      </BackButton>
    </StyledNotFound>
  )
}
