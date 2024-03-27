import styled from 'styled-components'

export const StyledButton = styled.button<{ $shadowed?: boolean }>`
  padding: 0.25rem 1rem;
  border-radius: 10px;
  color: #fff;
  background-color: var(--generalColor);
  box-shadow: ${(props) =>
    props.$shadowed ? 'var(--generalColor) 0px 8px 24px' : undefined};
`
