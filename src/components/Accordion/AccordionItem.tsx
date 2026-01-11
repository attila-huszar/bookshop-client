import { CaretDownIcon } from '@/assets/svg'
import { Content, Header, Item } from './AccordionItem.style'

export type AccordionItemProps = {
  panelKey?: number
  isOpen?: boolean
  setIsOpen?: (panelKey: number) => void
  header: string
  children: React.ReactNode
}

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
        <CaretDownIcon color="var(--grey)" />
      </Header>
      <Item $isOpen={isOpen}>
        <Content>{children}</Content>
      </Item>
    </>
  )
}
