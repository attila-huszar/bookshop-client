export type StyleTypes = {
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
