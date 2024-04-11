export type StyleTypes = {
  $textSize?: 'sm' | 'md' | 'lg'
  $padding?: 'sm' | 'md' | 'lg'
  $shadowed?: boolean
  $withCart?: boolean
}

export type ButtonTypes = StyleTypes & {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
  icon?: string
}
