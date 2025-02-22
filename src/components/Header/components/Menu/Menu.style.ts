import { styled } from 'styled-components'
import { MenuTypes } from './Menu.types'

export const StyledMenu = styled.div`
  position: relative;
`

export const Dropdown = styled.div<MenuTypes>`
  position: absolute;
  width: 12rem;
  top: 3rem;
  left: 0;
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: all 0.2s ease;

  ${({ $show }) => $show && 'grid-template-rows: 1fr; opacity: 1;'}
`

export const DropdownList = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
  list-style: none;
  background-color: #eaeaea;
  border-radius: 5px;
  cursor: pointer;
  z-index: 10;
  overflow: hidden;

  li:hover {
    background-color: lightgray;
  }

  li:first-child {
    border-radius: 5px 5px 0 0;
  }

  li:last-child {
    border-radius: 0 0 5px 5px;
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

  img {
    height: 1.5rem;
    width: 1.5rem;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
