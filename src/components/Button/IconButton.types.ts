export type StyleTypes = {
  $size?: 'xs' | 'sm' | 'md' | 'lg'
  $iconSize?: 'xs' | 'sm' | 'md' | 'lg'
  $color?: string
  $outline?: boolean
  $round?: boolean
  $flipHorizontal?: boolean
  $flipVertical?: boolean
}

export type IconButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes & { icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }
