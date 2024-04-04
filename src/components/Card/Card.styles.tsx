import styled from 'styled-components'

export const StyledCard = styled.div`
  display: flex;
  height: 17.5rem;
  width: 30rem;
  padding: 1rem;
  border-radius: 10px;
  transition: background-color 0.3s ease-out;

  &:hover {
    background-color: var(--bgMobileColor);
  }
`

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rem 0 0 2rem;
`

export const Image = styled.img`
  height: 100%;
  min-width: 11.25rem;
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

export const Currency = styled.span`
  margin-right: 0.5rem;
  font-size: 1.125rem;
`

export const Price = styled.span`
  font-size: 1.125rem;
`

export const Strikethrough = styled.span`
  position: relative;
  margin-left: 2rem;
  font-size: 1rem;
  color: var(--textGreyColor);

  &::after {
    content: '';
    position: absolute;
    width: calc(100% + 2ch);
    bottom: 50%;
    left: -1ch;
    border-bottom: 1px solid;
    pointer-events: none;
  }
`
