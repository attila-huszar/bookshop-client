import { IFilter } from '.'

export interface IInputEvent {
  target: EventTarget & HTMLInputElement
}

export interface IDiscountChangeEvent {
  target: {
    value: IFilter['discount']
  }
}
