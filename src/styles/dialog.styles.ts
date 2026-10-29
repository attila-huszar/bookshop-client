import { styled } from 'styled-components'
import { IconButton } from '@/components/Button'
import { media } from './media.breakpoints'

export const DialogCloseButton = styled(IconButton)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;

  &:hover:not(:disabled):not(:active) {
    background-color: var(--color-surface-container-highest);
  }
`

export const DialogHeader = styled.header`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 2px solid var(--color-outline-variant);
  background: var(--color-surface-container-high);

  h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  ${DialogCloseButton} {
    position: static;
    flex-shrink: 0;
  }
`

export const DialogBody = styled.div`
  min-height: 0;
  padding: 1.125rem 1.5rem;
  overflow-y: auto;
`

export const StyledDialog = styled.dialog`
  position: fixed;
  inset: 0;
  margin: auto;
  height: fit-content;
  width: 32rem;
  padding: 1.5rem 2rem;
  border: none;
  border-radius: 10px;
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
  box-shadow: var(--shadow-raised);

  ${media.down('sm')`
    width: 85%;
    padding: 1.5rem 1rem;
  `}
`
