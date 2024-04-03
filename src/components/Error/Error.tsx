import { StyledError } from './Error.styles'

export function Error({ error }: { error: Error }) {
  return <StyledError>{String(error)}</StyledError>
}
