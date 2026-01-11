import type { Filters } from './Filters'

export type InputEvent = {
  target: EventTarget & HTMLInputElement
}

export type DiscountChangeEvent = {
  target: {
    value: Filters['discount']
  }
}
