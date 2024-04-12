import styled from 'styled-components'

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
  height: 20rem;
  padding: 0.5rem;
`

export const OriginalImg = styled.div`
  position: relative;
  height: 95%;

  img {
    border-radius: 5px;
  }
`

export const MirroredImg = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: scaleY(-1);
  filter: blur(5px);
  opacity: 0.8;
`
