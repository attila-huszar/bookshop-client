import { SerializedError } from '@reduxjs/toolkit'
import { StyledError } from './Error.styles'
import WarningIcon from 'assets/svg/warning.svg?react'

export function Error({ error }: { error: string | SerializedError }) {
  return (
    <StyledError>
      <WarningIcon />
      {error as string}
    </StyledError>
  )
}
