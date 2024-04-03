export type StyleTypes = {
  size?: 'sm' | 'md' | 'lg'
  shadowed?: boolean
}

export type ButtonTypes = StyleTypes & {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
  icon?: string
}
