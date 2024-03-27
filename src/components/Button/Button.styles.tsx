import styled from 'styled-components'

export const StyledButton = styled.button<{ $shadowed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  outline: none;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.375rem 1.25rem;
  border-radius: 10px;
  color: #fff;
  background-color: var(--generalColor);
  box-shadow: ${(props) =>
    props.$shadowed ? 'var(--generalColor) 0px 8px 24px' : undefined};
`
