import styled from 'styled-components'

export const StyledAvatar = styled.button`
  display: flex;
  background-color: transparent;
  border-radius: 50%;
  border: 2px solid var(--secondary-color);
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    background-color: var(--light-grey);
  }

  img {
    padding: 2px;
    border-radius: 50%;
    overflow: hidden;
  }
`
