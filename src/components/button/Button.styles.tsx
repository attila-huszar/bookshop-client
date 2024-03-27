import styled from 'styled-components'

export const Button = styled.button<{ $shadowed?: boolean }>`
  color: #fff;
  padding: 0.25rem 1rem;
  border-radius: 10px;
  background-color: var(--generalColor);
  box-shadow: ${(props) =>
    props.$shadowed ? 'var(--generalColor) 0px 8px 24px' : undefined};
`
