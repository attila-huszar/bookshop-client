import { styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { StyledDialog } from '@/styles/dialog.styles'

export const StyledInfoDialog = styled(StyledDialog)`
  & > ${StyledButton} {
    margin: 1rem auto 0;
  }
`
