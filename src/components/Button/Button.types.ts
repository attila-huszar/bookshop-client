export type StyleTypes = {
  $size?: 'xs' | 'sm' | 'md' | 'lg' | 'wide'
  $textSize?: 'sm' | 'md' | 'lg' | 'xl'
  $shadowed?: boolean
  $withCart?: boolean
  $withCartAdd?: boolean
  $spinner?: boolean
  $inverted?: boolean
}

export type ButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes
