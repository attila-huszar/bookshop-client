import styled from 'styled-components'
import { MenuTypes } from './Menu.types'

export const StyledMenu = styled.div`
  position: relative;
`

export const Dropdown = styled.div<MenuTypes>`
  position: absolute;
  width: 8rem;
  top: 3rem;
  left: 0;
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: all 0.3s ease;

  ${({ $show }) => {
    if ($show) {
      return `
        grid-template-rows: 1fr;
        opacity: 1;
      `
    }
  }}
`

export const DropdownList = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
  list-style: none;
  background-color: #e1e1e6;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1;
  overflow: hidden;

  li {
    padding: 0.5rem 1rem;
  }

  li:hover {
    background-color: lightgray;
  }

  li:first-child {
    border-radius: 5px 5px 0 0;
  }

  li:last-child {
    border-radius: 0 0 5px 5px;
  }
`
