import styled from 'styled-components'

export const StyledAvatar = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border-radius: 50%;
  border: 2px solid var(--generalColor);
  overflow: hidden;
  cursor: pointer;

  img {
    border-radius: 50%;
  }
`
