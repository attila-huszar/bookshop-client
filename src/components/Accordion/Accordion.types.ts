import { ReactElement } from 'react'
import { AccordionItemProps } from './AccordionItem.types'

export type AccordionProps = {
  defaultOpenPanels?: number[]
  numberOfAllowedOpenPanels?: number | 'all'
  children: ReactElement<AccordionItemProps>[]
}
