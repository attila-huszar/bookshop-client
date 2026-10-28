import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'
import { ROUTE } from '@/routes/route'
import { useBookQuery } from '@/store/api/booksApi'
import { cartAdd } from '@/store/slices/cart'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { Price } from '@/components/Price'
import { Recommended } from '@/components/Recommended'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { scrollToTop } from '@/helpers/scrollToTop'
import { CacheTime } from '@/constants/cacheTimes'
import type { Book } from '@/types'
import { CartAddIcon, ChevronLeftIcon, imagePlaceholder } from '@/assets/svg'
import {
  BookAuthor,
  BookTitle,
  Breadcrumb,
  ButtonWrapper,
  Description,
  DetailsSection,
  ImageWrapper,
  StyledProduct,
} from './Product.style'

export function Product() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const rawId = searchParams.get('id') ?? ''
  const parsedId = /^\d+$/.test(rawId) ? Number(rawId) : NaN
  const id = Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null
  const { isMobile } = useBreakpoints()

  const {
    currentData: book,
    isFetching,
    isError,
  } = useBookQuery(id ?? skipToken, {
    refetchOnMountOrArgChange: CacheTime.FiveMinutes,
  })
  const isBookInCart = useAppSelector((state) =>
    state.cart.cartItems.some((item) => item.id === book?.id),
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  const handleCartAction = (book: Book) => {
    if (isBookInCart) {
      void navigate(`/${ROUTE.CART}`)
    } else {
      dispatch(cartAdd({ id: book.id }))
    }
  }

  const handleGoBack = () => {
    if (window.history?.length && window.history.length > 2) {
      void navigate(-1)
    } else {
      void navigate('/')
    }
  }

  return (
    <>
      <StyledProduct>
        <Breadcrumb onClick={handleGoBack} title={t('common.actions.goBack')}>
          <ChevronLeftIcon height={18} />
          {t('catalogue.details')}
        </Breadcrumb>
        {!book && id && isFetching ? (
          <Loading message={t('catalogue.detailsLoading')} fullScreen />
        ) : book ? (
          <DetailsSection>
            <ImageWrapper>
              <img
                src={book.imgUrl}
                alt={book.title}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = imagePlaceholder)
                }
                width="100%"
              />
            </ImageWrapper>
            <BookTitle>{book.title}</BookTitle>
            <BookAuthor>{book.author ?? t('common.unknownAuthor')}</BookAuthor>
            <Price
              component="product"
              price={book.price}
              discount={book.discount}
            />
            <Description>
              <h2>{t('catalogue.summary')}</h2>
              <p>{book.description}</p>
            </Description>
            <ButtonWrapper>
              <Button
                onClick={() => handleCartAction(book)}
                $icon={!isBookInCart && <CartAddIcon />}
                $size={isMobile ? 'md' : 'lg'}
                $textSize={isMobile ? 'md' : 'lg'}>
                {isBookInCart
                  ? t('catalogue.viewBasket')
                  : t('catalogue.addToBasket')}
              </Button>
            </ButtonWrapper>
          </DetailsSection>
        ) : (
          (isError || !id) && (
            <Alert message={t('catalogue.notFound')} backButton />
          )
        )}
      </StyledProduct>
      <Recommended />
    </>
  )
}
