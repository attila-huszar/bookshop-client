export type StyleTypes = {
  $textSize?: 'sm' | 'md' | 'lg' | 'xl'
  $padding?: 'sm' | 'md' | 'lg' | 'wide'
  $shadowed?: boolean
  $withCart?: boolean
  $inverted?: boolean
}

export type ButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes
