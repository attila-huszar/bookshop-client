import { StyledAccordion, Header, Item, Content } from './Accordion.styles'
import CaretUp from '../../assets/svg/caret_up.svg?react'
import CaretDown from '../../assets/svg/caret_down.svg?react'

export function Accordion({
  panelKey,
  isOpen,
  setIsOpen,
  header,
  children,
}: {
  panelKey: number
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  header: string
  children: React.ReactNode
}) {
  return (
    <StyledAccordion>
      <Header onClick={() => setIsOpen(!isOpen)}>
        <p>{header}</p>
        {isOpen ? (
          <CaretUp color="var(--grey)" />
        ) : (
          <CaretDown color="var(--grey)" />
        )}
      </Header>
      <Item $show={isOpen}>
        <Content>{children}</Content>
      </Item>
    </StyledAccordion>
  )
}
