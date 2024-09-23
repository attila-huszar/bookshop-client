import { styled } from 'styled-components'
import { AccordionItemTypes } from './AccordionItem.types'

export const Header = styled.div<AccordionItemTypes>`
  display: flex;
  justify-content: space-between;
  height: 2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-out;

  svg {
    height: 1.5rem;
    transition: transform 0.3s ease-out;

    ${({ $isOpen }) => $isOpen && 'transform: scaleY(-1);'}
  }

  &:hover {
    background-color: var(--whitesmoke);
  }
`

export const Item = styled.div<AccordionItemTypes>`
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s ease;

  ${({ $isOpen }) => $isOpen && 'grid-template-rows: 1fr; opacity: 1;'}
`

export const Content = styled.div`
  overflow: hidden;

  > button {
    display: block;
    margin: 0.25rem auto 0;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`
