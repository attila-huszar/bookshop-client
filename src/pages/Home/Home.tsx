import { StyledHome } from './Home.styles'
import { Card } from '../../components'
import { IBook } from '../../interfaces/IBook'

export function Home({ data }: { data: IBook[] | Error | undefined }) {
  if (!data) {
    return <div>Loading...</div>
  }

  if (data instanceof Error) {
    return <div>{String(data)}</div>
  }

  return (
    <StyledHome>
      {data.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </StyledHome>
  )
}
