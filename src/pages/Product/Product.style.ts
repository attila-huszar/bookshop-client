import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledProduct = styled.main`
  padding: 0 6.25rem;

  ${media.down('sm')`
    padding: 0 1rem;
  `}
`

export const Breadcrumb = styled.button`
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  background: none;
  cursor: pointer;

  ${media.down('sm')`
    font-size: 1rem;
  `}
`

export const DetailsSection = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: 26rem 1fr max-content;
  grid-template-rows: max-content max-content 1fr;
  column-gap: 3rem;
  min-height: 35rem;
  margin: 3rem 0 6rem;

  ${media.down('sm')`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: auto;
    margin: 1.5rem 0 3rem;
  `}
`

export const ImageWrapper = styled.div`
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  padding: 3rem;
  background-color: #f4f4ff;
  border: 1px solid #e5e5e5;
  border-radius: var(--border-radius);

  img {
    border-radius: var(--border-radius);
    box-shadow:
      rgba(0, 0, 0, 0.19) 0px 10px 20px,
      rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }

  ${media.down('sm')`
    width: min(100%, 24rem);
    align-self: center;
    padding: 1.5rem;
  `}
`

export const BookTitle = styled.p`
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  font-size: 2rem;
  font-weight: 700;
  text-wrap: pretty;
  margin-bottom: 1rem;

  ${media.down('sm')`
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  `}
`

export const BookAuthor = styled.p`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  font-size: 1.5rem;
  font-weight: 700;
  text-wrap: pretty;
  color: var(--grey);

  &:empty::before {
    content: '';
    display: inline-block;
  }

  ${media.down('sm')`
    font-size: 1.125rem;
  `}
`

export const Description = styled.div`
  grid-column: 2 / 4;
  grid-row: 3 / 4;
  padding: 5rem 0 4rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    color: var(--grey);
  }

  ${media.down('sm')`
    padding: 0;

    h2 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 1rem;
    }
  `}
`

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;

  ${media.down('sm')`
    position: static;
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
  `}
`
