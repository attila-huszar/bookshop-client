import { StyledError } from './Error.styles'

export function Error({ error }: { error: string }) {
  return <StyledError>{error}</StyledError>
}
