import { Link, useParams } from 'react-router-dom'
import { StyledProduct, Breadcrumb } from './Product.styles'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBook } from '../../store/booksSlice'
import { bookSelector } from '../../store/selectors'
import { AppDispatch } from '../../store/store'
import { IBook } from '../../interfaces'

export function Product() {
  const { id } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const bookFromStore = useSelector(bookSelector(id))
  const [bookFromFetch, setBookFromFetch] = useState<IBook | null>(null)

  useEffect(() => {
    if (!bookFromStore && id) {
      const fetchData = async () => {
        try {
          const data = await dispatch(fetchBook(id))
          setBookFromFetch(data.payload)
        } catch (error) {
          console.log(error)
        }
      }
      fetchData()
    }
  }, [bookFromStore, dispatch, id])

  return (
    <StyledProduct>
      <Link to="..">
        <Breadcrumb>Book Details</Breadcrumb>
      </Link>
      <div>Product: {id}</div>
      <div>Title: {bookFromStore?.title || bookFromFetch?.title}</div>
    </StyledProduct>
  )
}
