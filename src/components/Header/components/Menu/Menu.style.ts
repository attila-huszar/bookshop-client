import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledMenu = styled.div`
  position: relative;
`

export const MenuList = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 1.25rem;
  list-style: none;
  background-color: #eaeaea;
  border-radius: var(--border-radius);
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
    cursor: pointer;
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
