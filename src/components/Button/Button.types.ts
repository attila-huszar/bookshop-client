export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'neutral'

export type StyleTypes = {
  $color?: ButtonColor
  $icon?: React.ReactNode
  $iconPos?: 'left' | 'right'
  $size?: 'xs' | 'sm' | 'smMd' | 'md' | 'lg' | 'wide'
  $textSize?: 'sm' | 'md' | 'lg' | 'xl'
  $shadow?: boolean
  $inverted?: boolean
}

export type ButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes
