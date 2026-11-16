import { styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const StyledProduct = styled.main`
  --page-loading-height: calc(100dvh - 9.375rem);

  padding: 0 6.25rem;

  ${media.down('lg')`
    padding: 0 3rem;
  `}

  ${media.down('sm')`
    --page-loading-height: calc(100dvh - 6.5rem);

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
  border-radius: var(--border-radius);
  cursor: pointer;

  ${media.down('sm')`
    font-size: 1rem;
  `}
`

export const DetailsSection = styled.section`
  display: grid;
  grid-template-columns: 26rem minmax(0, 1fr) max-content;
  grid-template-rows: max-content max-content 1fr auto;
  column-gap: 3rem;
  min-height: 35rem;
  margin: 3rem 0 6rem;

  ${media.down('lg')`
    grid-template-columns: 20rem minmax(0, 1fr) max-content;
    column-gap: 2rem;
    min-height: 28rem;
  `}

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
  grid-row: 1 / 5;
  align-self: start;
  padding: 3rem;
  background-color: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--border-radius);

  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-book);
  }

  ${media.down('lg')`
    padding: 2rem;
  `}

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

  ${media.down('lg')`
    font-size: 1.75rem;
  `}

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
  color: var(--color-on-surface-variant);

  &:empty::before {
    content: '';
    display: inline-block;
  }

  ${media.down('lg')`
    font-size: 1.25rem;
  `}

  ${media.down('sm')`
    font-size: 1.125rem;
  `}
`

export const Description = styled.div`
  grid-column: 2 / 4;
  grid-row: 3 / 4;
  padding: 5rem 0 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    color: var(--color-on-surface-variant);
  }

  ${media.down('lg')`
    padding-top: 3rem;

    h2 {
      font-size: 1.375rem;
    }

    p {
      font-size: 1.125rem;
    }
  `}

  ${media.down('sm')`
    padding: 0 0 0.5rem;

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
  grid-column: 2 / 4;
  grid-row: 4 / 5;
  align-self: end;
  justify-self: end;

  ${media.down('sm')`
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
  `}
`
