import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledInfoDialog = styled.dialog`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1.5rem 1rem;
  border: none;
  outline: none;
  border-radius: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;

  &::backdrop {
    background: rgba(0, 0, 0, 0.35);
  }

  & > button {
    margin: 1rem auto 0;
  }

  ${media.down('sm')`
    width: 85%;
  `}
`
