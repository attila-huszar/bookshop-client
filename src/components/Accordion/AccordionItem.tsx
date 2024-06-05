import { Header, Item, Content } from './AccordionItem.styles'
import Caret from 'assets/svg/caret_down.svg?react'

export function AccordionItem({
  panelKey = 0,
  isOpen = true,
  setIsOpen = () => {},
  header,
  children,
}: {
  header: string
  panelKey?: number
  isOpen?: boolean
  setIsOpen?: (panelKey: number) => void
  children: React.ReactNode
}) {
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
