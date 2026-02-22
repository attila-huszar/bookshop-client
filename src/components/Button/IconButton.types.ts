export type StyleTypes = {
  $size?: 'xs' | 'sm' | 'md' | 'lg'
  $color?: string
  $outline?: boolean
  $round?: boolean
  $flipH?: boolean
  $flipV?: boolean
}

export type IconButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes & { icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }
