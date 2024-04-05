import styled from 'styled-components'
import caret_left from '../../assets/svg/caret_left.svg'

export const StyledProduct = styled.main`
  padding: 0 6.25rem;
`

export const Breadcrumb = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  background: none;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    left: -2rem;
    height: 20px;
    width: 20px;
    background: url(${caret_left}) center no-repeat;
  }
`

export const DetailsSection = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: 26rem 1fr max-content;
  grid-template-rows: max-content max-content 1fr;
  column-gap: 3rem;
  min-height: 35rem;
`

export const ImageWrapper = styled.div`
  grid-column: 1 / 2;
  grid-row: 1 / 4;
  padding: 3rem;
  background-color: #f4f4ff;

  img {
    border-radius: 10px;
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
`

export const Title = styled.p`
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  font-size: 2rem;
  font-weight: 700;
  text-wrap: balance;
  margin-bottom: 1rem;
`

export const Author = styled.p`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  font-size: 1.5rem;
  font-weight: 700;
  text-wrap: balance;
  color: var(--textGreyColor);
`

export const Price = styled.p`
  grid-column: 3 / 4;
  grid-row: 1 / 3;
  align-self: center;

  span {
    font-size: 1.25rem;
    font-weight: 700;
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
    color: var(--textGreyColor);
  }
`

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`
