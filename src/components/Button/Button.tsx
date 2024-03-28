import { StyledButton, IconButton } from './Button.styles'

export function Button({
  onClick,
  icon,
  children,
}: {
  onClick: () => void
  icon?: string
  children?: React.ReactNode
}) {
  if (icon) {
    return (
      <IconButton onClick={onClick}>
        <img src={icon} />
      </IconButton>
    )
  }

  return <StyledButton onClick={onClick}>{children}</StyledButton>
}
