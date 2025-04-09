import type { FilterProps } from './FilterProps'

export type InputEvent = {
  target: EventTarget & HTMLInputElement
}

export type DiscountChangeEvent = {
  target: {
    value: FilterProps['discount']
  }
}
