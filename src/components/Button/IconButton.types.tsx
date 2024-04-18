export type StyleTypes = {
  $iconSize?: 'sm' | 'md' | 'lg'
}

export type IconButtonTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  StyleTypes & { icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }
