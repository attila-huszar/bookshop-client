export type StyleTypes = {
  $clip?: boolean
  $camera?: boolean
}

export type AvatarTypes = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { imgUrl: string; size?: number } & StyleTypes
