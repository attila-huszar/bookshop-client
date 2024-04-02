import { StyledHome } from './Home.styles'
import { ErrorDiv } from '../../components'
import { LoadingDiv } from '../../components'
import { Card } from '../../components'
import { IBook } from '../../interfaces/IBook'

export function Home({ data }: { data: IBook[] | Error | undefined }) {
  if (!data) {
    return <LoadingDiv />
  }

  if (data instanceof Error) {
    return <ErrorDiv error={data} />
  }

  return (
    <StyledHome>
      {data.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </StyledHome>
  )
}
