export type StyleTypes = {
  $iconSize?: 'sm' | 'lg'
}

export type IconButtonTypes = StyleTypes & {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  icon: React.ReactNode
  label: string
}
