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

export const Details = styled.section`
  display: grid;
  grid-template-columns: 26rem auto;
  grid-template-rows: 3.5rem 3.5rem auto;
  gap: 2rem;
  min-height: 35rem;
`

export const ImageWrapper = styled.div`
  grid-column: 1 / 1;
  grid-row: 1 / 4;
  padding: 3rem;
  background-color: #f4f4ff;

  img {
    border-radius: 10px;
    box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
`
