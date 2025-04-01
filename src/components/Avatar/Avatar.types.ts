export type StyleTypes = {
  $size?: number
  $clip?: boolean
  $camera?: boolean
}

export type AvatarTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { imgUrl?: string } & StyleTypes
