import { useId } from 'react'
import { ChevronDownIcon } from '@/assets/svg'
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
  const panelId = useId()

  return (
    <>
      <h3>
        <Header
          type="button"
          $isOpen={isOpen}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(panelKey)}>
          <span>{header}</span>
          <ChevronDownIcon aria-hidden="true" />
        </Header>
      </h3>
      <Item id={panelId} $isOpen={isOpen} inert={!isOpen}>
        <Content>{children}</Content>
      </Item>
    </>
  )
}
