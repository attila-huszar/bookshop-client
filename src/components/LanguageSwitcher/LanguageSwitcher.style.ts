import { css, styled } from 'styled-components'
import { media } from '@/styles/media.breakpoints'

export const Switcher = styled.div<{ $variant: 'menu' | 'icon' }>`
  position: relative;
  display: ${({ $variant }) => ($variant === 'menu' ? 'block' : 'flex')};
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0;

  img {
    flex-shrink: 0;
    object-fit: contain;
  }

  p {
    flex-basis: 100%;
    padding: ${({ $variant }) => ($variant === 'menu' ? '0.5rem 0.75rem' : '0')};
    font-size: 0.75rem;
  }

  ${({ $variant }) =>
    $variant === 'icon' &&
    css`
      flex-shrink: 0;

      > button {
        height: 2.25rem;
        border-width: 2px;
        background-color: var(--color-surface-container-lowest);

        &:hover:not(:disabled) {
          background-color: var(--color-primary-container);
        }

        ${media.down('sm')`
          height: 2.5rem;
        `}
      }

      p {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        width: min(16rem, calc(100vw - 2rem));
        padding: 0.5rem;
        border-radius: var(--border-radius);
        background: var(--color-surface-container-high);
        box-shadow: var(--shadow-popover);
        z-index: 1;
      }
    `}
`

export const MenuLanguageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`
