import styled from 'styled-components'

export const StyledCard = styled.div`
  display: flex;
  height: 17.5rem;
  width: 30rem;
  padding: 1rem;
`

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rem 0 0 2rem;
`

export const Image = styled.img`
  height: 100%;
  width: 11.25rem;
  border-radius: 5px;
  object-fit: cover;
`

export const Title = styled.p`
  font-size: 1.125rem;
`

export const Description = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 1rem;
  color: var(--textGreyColor);
  overflow: hidden;
`

export const PriceBeforeDiscount = styled.span`
  position: relative;
  margin-left: 1.5rem;
  color: var(--textGreyColor);

  &::after {
    content: '';
    position: absolute;
    width: 125%;
    height: 50%;
    top: 0;
    left: 0;
    transform: translateX(-10%);
    border-bottom: 1px solid;
    pointer-events: none;
  }
`
