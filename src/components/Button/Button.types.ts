export type StyleTypes = {
  $textSize?: 'sm' | 'md' | 'lg' | 'xl'
  $padding?: 'sm' | 'md' | 'lg' | 'wide'
  $shadowed?: boolean
  $withCart?: boolean
}

export type ButtonTypes = StyleTypes & {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  label?: string
}
