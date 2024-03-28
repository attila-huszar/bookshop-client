import styled from 'styled-components'

export const StyledCard = styled.div`
  display: flex;
  height: 17.5rem;
  width: 30rem;
  padding: 1rem;
`

export const CardDetails = styled.div`
  padding: 4rem 0 0 2rem;
`

export const CardImage = styled.img`
  height: 15.625rem;
  width: 11.25rem;
  border-radius: 5px;
  object-fit: cover;
`

export const CardText = styled.p`
  margin-bottom: 1rem;
  font-size: 1.125rem;
`

export const CardGreyText = styled.p`
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--textGreyColor);
`

export const CardPriceStrikethrough = styled.span`
  margin-left: 1.5rem;
  color: var(--textGreyColor);
  text-decoration: line-through;
`
