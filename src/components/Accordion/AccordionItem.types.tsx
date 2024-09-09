export type AccordionItemProps = {
  panelKey?: number
  isOpen?: boolean
  setIsOpen?: (panelKey: number) => void
  header: string
  children: React.ReactNode
}

export type AccordionItemTypes = {
  $isOpen: boolean
}
