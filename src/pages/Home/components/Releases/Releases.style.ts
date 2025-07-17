import { styled } from 'styled-components'
import { ReleasesTypes } from './Releases.types'

export const StyledReleases = styled.section`
  display: flex;
  justify-content: space-between;
  gap: 2.5rem;
  width: 100%;
  max-width: var(--max-width);
  padding: 3rem 6.25rem 2.5rem;
  overflow-x: clip;
`

export const Welcome = styled.div`
  width: 50%;

  h2 {
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
  margin-left: -9rem;
`

export const ImageItem = styled.div<ReleasesTypes>`
  position: relative;
  grid-row: 1;
  user-select: none;
  transition: 0.2s ease-out;

  &:hover {
    transform: scale(1.25);
  }

  ${({ $idx }) =>
    ($idx === 0 && 'height: 18rem; right: -80%; &:hover { z-index: 2; }') ||
    ($idx === 1 && 'height: 20rem; right: -40%; z-index: 1;') ||
    ($idx === 2 && 'height: 18rem; &:hover { z-index: 2; }') ||
    ($idx > 2 && 'display: none;')}

  img {
    height: 100%;
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  }
`

export const MirrorImg = styled.div`
  pointer-events: none;

  img {
    position: absolute;
    margin-top: -8px;
    transform: translateY(-100%) perspective(500px) rotateX(60deg) scaleY(-1);
    filter: blur(3px);
    transform-origin: bottom;
    mask-image: linear-gradient(to bottom, transparent 90%, black 100%);
  }
`
