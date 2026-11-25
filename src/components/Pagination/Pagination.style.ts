import { styled } from 'styled-components'
import { buttonInteractionStyles } from '@/styles/button.styles'

export const StyledPagination = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`

export const PageSelectButton = styled.button`
  ${buttonInteractionStyles}
  height: 2rem;
  min-width: 2rem;
  padding-inline: 0.25rem;
  font-size: 0.875rem;
  font-weight: 650;
  color: var(--color-on-surface-variant);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--button-radius);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: var(--color-surface-container);
    }
  }

  &:active:not(:disabled) {
    background-color: var(--color-surface-container-highest);
  }

  &:disabled {
    color: var(--color-on-primary);
    background-color: var(--color-primary);
    cursor: default;
  }
`
