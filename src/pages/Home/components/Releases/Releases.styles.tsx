import styled from 'styled-components'
import { ReleasesTypes } from './Releases.types'

export const StyledReleases = styled.section`
  display: flex;
  width: 100%;
  max-width: 90rem;
  padding: 2.5rem 6.25rem;

  div {
    width: 50%;
  }

  h1 {
    margin-bottom: 2rem;
  }

  p {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`

export const ImageWrapper = styled.div`
  display: grid;
  align-items: center;
  margin: 0 auto;
`

export const ImageItem = styled.div<ReleasesTypes>`
  position: relative;
  grid-row: 1;

  ${({ $idx }) =>
    ($idx === 0 && 'height: 20rem; z-index: 2;') ||
    ($idx === 1 && 'height: 18rem; margin-left: -50%; z-index: 1;') ||
    ($idx === 2 && 'height: 16rem; margin-left: -100%;') ||
    ($idx > 2 && 'display: none;')}

  img {
    height: 100%;
    border-radius: 3px;
  }
`

export const MirrorImg = styled.div`
  img {
    position: absolute;
    margin-top: -5px;
    transform: scale(1.025, -1);
    filter: blur(4px);
    mask-image: linear-gradient(to bottom, transparent 95%, black 100%);
  }
`
