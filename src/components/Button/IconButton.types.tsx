export type StyleTypes = {
  $iconSize?: 'sm' | 'md' | 'lg'
  $color?: string
  $bordered?: boolean
  $flipHorizontal?: boolean
  $flipVertical?: boolean
}

export type IconButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes & { icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }
