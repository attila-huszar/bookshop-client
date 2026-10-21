import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate } from 'react-router'
import { skipToken } from '@reduxjs/toolkit/query'
import type { productLoader } from '@/routes/loaders/productLoader'
import { ROUTE } from '@/routes/route'
import { useBookQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { Price } from '@/components/Price'
import { Recommended } from '@/components/Recommended'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useCart } from '@/hooks/useCart'
import { scrollToTop } from '@/helpers/scrollToTop'
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
  const id = useLoaderData<typeof productLoader>()
  const { cartItems, addToCart } = useCart()
  const { isMobile } = useBreakpoints()

  const {
    currentData: book,
    isFetching,
    isError,
  } = useBookQuery(id ?? skipToken, {
    refetchOnMountOrArgChange: cacheTimes.catalogue,
  })
  const isBookInCart = cartItems.some((item) => item.id === book?.id)

  useEffect(() => {
    scrollToTop()
  }, [])

  const handleCartAction = (book: Book) => {
    if (isBookInCart) {
      void navigate(`/${ROUTE.CART}`)
    } else {
      addToCart(book)
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
