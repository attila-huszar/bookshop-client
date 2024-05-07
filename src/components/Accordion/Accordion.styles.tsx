import styled from 'styled-components'
import { AccordionTypes } from './Accordion.types'

export const StyledAccordion = styled.div``

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  height: 2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease-out;

  svg {
    height: 1.5rem;
  }

  &:hover {
    background-color: var(--whitesmoke);
  }
`

export const Item = styled.div<AccordionTypes>`
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s ease;

  ${({ $show }) => $show && 'grid-template-rows: 1fr; opacity: 1;'}
`

export const Content = styled.div`
  overflow: hidden;

  & > button {
    display: block;
    margin: 0.25rem auto 0;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`
