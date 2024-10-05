import { Header, Item, Content } from './AccordionItem.style'
import { AccordionItemProps } from './AccordionItem.types'
import Caret from '@/assets/svg/caret_down.svg?react'

export function AccordionItem({
  panelKey = 0,
  isOpen = true,
  setIsOpen = () => undefined,
  header,
  children,
}: AccordionItemProps) {
  return (
    <>
      <Header $isOpen={isOpen} onClick={() => setIsOpen(panelKey)}>
        <p>{header}</p>
        <Caret color="var(--grey)" />
      </Header>
      <Item $isOpen={isOpen}>
        <Content>{children}</Content>
      </Item>
    </>
  )
}
