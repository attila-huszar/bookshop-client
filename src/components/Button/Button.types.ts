export type StyleTypes = {
  $textSize?: 'sm' | 'lg' | 'xl'
  $padding?: 'sm' | 'lg' | 'wide'
  $shadowed?: boolean
  $withCart?: boolean
}

export type ButtonTypes = StyleTypes & {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  label?: string
}
