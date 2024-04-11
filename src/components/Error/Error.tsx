import { StyledError } from './Error.styles'
import { SerializedError } from '@reduxjs/toolkit'

export function Error({ error }: { error: SerializedError | null }) {
  return <StyledError>{error as string}</StyledError>
}
