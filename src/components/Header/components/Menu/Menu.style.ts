import { css, styled } from 'styled-components'
import { media } from '@/styles'
import { MenuTypes } from './Menu.types'

export const StyledMenu = styled.div`
  position: relative;
`

export const Backdrop = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;

  ${({ $show }) =>
    $show &&
    `
    opacity: 1;
    visibility: visible;
  `}
`

export const MenuPanel = styled.div<MenuTypes>`
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
  z-index: 100;
  background-color: var(--white);

  ${media.down('sm')`
    position: fixed;
    top: 0;
    left: 1rem;
    width: 60vw;
    height: 100vh;
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    opacity: 1;
    grid-template-rows: 1fr;
    box-shadow: none;
  `}

  ${({ $show }) => css`
    ${$show &&
    `
    grid-template-rows: 1fr;
    opacity: 1;
  `}

    ${media.down('sm')`
    transform: ${$show ? 'translateX(-1rem)' : 'translateX(calc(-100% - 2rem))'};
  `}
  `}
`

export const MenuList = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
  list-style: none;
  background-color: #eaeaea;
  border-radius: var(--border-radius);
  cursor: pointer;
  z-index: 10;
  overflow: hidden;

  li:first-child {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  li:last-child {
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }

  ${media.down('sm')`
    height: 100%;
    border-radius: 0;
    padding-top: 4rem;
    background-color: var(--white);

    li:first-child {
      border-radius: 0;
    }

    li:last-child {
      border-radius: 0;
    }
  `}

  li:hover {
    background-color: lightgray;
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
