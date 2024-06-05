import { IFilter } from './IFilter'

export interface IInputEvent {
  target: EventTarget & HTMLInputElement
}

export interface IDiscountChangeEvent {
  target: {
    value: IFilter['discount']
  }
}
