import { styled } from 'styled-components'

export const StyledNewsCard = styled.div`
  display: flex;
  height: 11.25rem;
  width: 37.125rem;
  padding: 0 0.75rem;
  border-radius: 10px;
`

export const Details = styled.div`
  margin-right: 2rem;

  h3 {
    margin-bottom: 1rem;
  }

  div {
    width: 64px;
    margin-bottom: 1rem;
    border-bottom: 3px solid var(--primary-color);
  }

  p {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

export const ImageWrap = styled.div`
  height: 10rem;
  width: 100%;

  img {
    height: 100%;
  }
`
