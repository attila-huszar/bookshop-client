import styled from 'styled-components'

export const StyledAvatar = styled.button`
  display: flex;
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--secondary-color);
  cursor: pointer;
  transition: all 0.3s ease-out;

  &::after {
    content: '';
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #ecb34630;
    border-radius: 50%;
  }

  &:hover::after {
    opacity: 1;
  }

  img {
    padding: 2px;
    border-radius: 50%;
    overflow: hidden;
  }
`
