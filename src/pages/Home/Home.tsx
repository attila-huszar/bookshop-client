import { StyledHome } from './Home.styles'
import { Recommended } from '../../components'
import { Releases } from './components/Releases/Releases'
import { TopSellers } from './components/TopSellers/TopSellers'
import { News } from './components/News/News'

export function Home() {
  return (
    <StyledHome>
      <Releases />
      <TopSellers />
      <Recommended />
      <News />
    </StyledHome>
  )
}
