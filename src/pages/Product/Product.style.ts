import { styled } from 'styled-components'

export const StyledProduct = styled.main`
  padding: 0 6.25rem;
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
`

export const DetailsSection = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: 26rem 1fr max-content;
  grid-template-rows: max-content max-content 1fr;
  column-gap: 3rem;
  min-height: 35rem;
  margin: 3rem 0 6rem;
`

export const ImageWrapper = styled.div`
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  padding: 3rem;
  background-color: #f4f4ff;
  border: 1px solid #e5e5e5;
  border-radius: 5px;

  img {
    border-radius: 5px;
    box-shadow:
      rgba(0, 0, 0, 0.19) 0px 10px 20px,
      rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }
`

export const BookTitle = styled.p`
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  font-size: 2rem;
  font-weight: 700;
  text-wrap: balance;
  margin-bottom: 1rem;
`

export const BookAuthor = styled.p`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  font-size: 1.5rem;
  font-weight: 700;
  text-wrap: balance;
  color: var(--grey);

  &:empty::before {
    content: '';
    display: inline-block;
  }
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
`

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`
