import { styled } from 'styled-components'

type AccordionItemTypes = {
  $isOpen: boolean
}

export const Header = styled.button<AccordionItemTypes>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 2rem;
  padding: 0.25rem 0.5rem;
  border: 0;
  border-radius: var(--border-radius);
  background: transparent;
  color: inherit;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease-out;

  svg {
    height: 1.5rem;
    color: var(--color-on-surface-variant);
    transition: transform 0.3s ease-out;

    ${({ $isOpen }) => $isOpen && 'transform: rotate(180deg);'}
  }

  &:hover {
    background-color: var(--color-surface-container);
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

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const Content = styled.div`
  overflow: hidden;
`
