import { styled } from 'styled-components'

export const StyledConfirmDialog = styled.dialog`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 25rem;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  background: var(--white);
  box-shadow: var(--shadow);

  > p {
    text-align: center;
    text-wrap: pretty;
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }

  > div {
    display: flex;
    gap: 1rem;
  }
`
