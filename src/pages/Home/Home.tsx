import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getData } from '../../store/api'
import { RootState, AppDispatch } from '../../store/store'
import { StyledHome } from './Home.styles'
import { ErrorDiv } from '../../components'
import { LoadingDiv } from '../../components'
import { Card } from '../../components'

export function Home() {
  const { data, error } = useSelector((state: RootState) => state.books)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(getData('books'))
  }, [dispatch])

  if (!data) {
    return <LoadingDiv />
  }

  if (error) {
    return <ErrorDiv error={error} />
  }

  return (
    <StyledHome>
      {data.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </StyledHome>
  )
}
