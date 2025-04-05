export type StyleTypes = {
  $size?: number
  $clip?: boolean
}

export type AvatarTypes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & { imgUrl?: string } & StyleTypes
