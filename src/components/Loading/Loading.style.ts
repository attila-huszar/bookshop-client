import { styled } from 'styled-components'

export const StyledLoading = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;

  ${({ $fullScreen }) => $fullScreen && 'height: 100vh;'}

  svg {
    height: 2.5rem;
  }
`

export const Text = styled.p`
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
`
