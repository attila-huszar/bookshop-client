import { styled } from 'styled-components'
import { MenuTypes } from './Menu.types'

export const StyledMenu = styled.div`
  position: relative;
`

export const Dropdown = styled.div<MenuTypes>`
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  position: absolute;
  top: 3rem;
  left: 0;
  width: 12rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: all 0.2s ease;

  ${({ $show }) => $show && 'grid-template-rows: 1fr; opacity: 1;'}
`

export const DropdownList = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
  list-style: none;
  background-color: #eaeaea;
  border-radius: var(--border-radius);
  cursor: pointer;
  z-index: 10;
  overflow: hidden;

  li:hover {
    background-color: lightgray;
  }

  li:first-child {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  li:last-child {
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }

  & a {
    display: block;
  }
`

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;

  > svg {
    height: 1.5rem;
    width: 1.5rem;
  }

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
