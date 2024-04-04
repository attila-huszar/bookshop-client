import { StyledError } from './Error.styles'
import { SerializedError } from '@reduxjs/toolkit'

export function Error({ error }: { error: SerializedError }) {
  return <StyledError>{`${error}`}</StyledError>
}
