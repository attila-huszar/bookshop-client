import { css } from 'styled-components'

export const dropdownSurfaceStyles = css`
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
  border: 1px solid var(--color-outline);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-popover);
  overflow: hidden;
`

export const dropdownListStyles = css`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 1rem;
`

export const dropdownOptionStyles = css`
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: transparent;
  color: var(--color-on-surface);

  &:hover,
  &:focus-visible {
    background-color: var(--color-surface-container-low);
  }

  &[aria-selected='true'],
  &:checked {
    background-color: var(--color-secondary-container);
    color: var(--color-on-secondary-container);
    font-weight: 600;
  }
`
