import type { ComponentPropsWithoutRef } from 'react'

export type AvatarTypes = ComponentPropsWithoutRef<'button'> & {
  imgUrl?: string
  $size?: number
  $hoverControls?: boolean
}
