export type StyleTypes = {
  $size?: number
  $hoverControls?: boolean
}

export type AvatarTypes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & { imgUrl?: string } & StyleTypes
