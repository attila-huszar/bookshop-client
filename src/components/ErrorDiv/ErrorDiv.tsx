import { StyledErrorDiv } from './ErrorDiv.styles'

export function ErrorDiv({ error }: { error: Error }) {
  return <StyledErrorDiv>{String(error)}</StyledErrorDiv>
}
