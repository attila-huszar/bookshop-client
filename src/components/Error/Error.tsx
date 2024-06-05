import { SerializedError } from '@reduxjs/toolkit'
import { StyledError } from './Error.styles'

export function Error({ error }: { error: SerializedError | null }) {
  return <StyledError>{error as string}</StyledError>
}
