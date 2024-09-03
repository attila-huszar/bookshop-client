import { useState, ReactElement, isValidElement } from 'react'
import { AccordionItem } from './AccordionItem'
import { AccordionProps } from './Accordion.types'
import { AccordionItemProps } from './AccordionItem.types'

export function Accordion({
  defaultOpenPanels = [0],
  numberOfAllowedOpenPanels = 3,
  children,
}: AccordionProps) {
  const [openPanels, setOpenPanels] = useState(defaultOpenPanels)

  const togglePanel = (panelKey: number) => {
    setOpenPanels((prevState) => {
      const newPanelsOpen = [...prevState]

      if (newPanelsOpen.includes(panelKey)) {
        newPanelsOpen.splice(newPanelsOpen.indexOf(panelKey), 1)
      } else {
        if (
          typeof numberOfAllowedOpenPanels === 'number' &&
          newPanelsOpen.length > numberOfAllowedOpenPanels
        ) {
          newPanelsOpen.shift()
        }
        newPanelsOpen.push(panelKey)
      }

      return newPanelsOpen
    })
  }

  function renderItem(
    child: ReactElement<AccordionItemProps>,
    panelKey: number,
  ) {
    if (isValidElement(child) && child.type === AccordionItem) {
      return (
        <AccordionItem
          key={`accordion-item-${panelKey}`}
          panelKey={panelKey}
          isOpen={openPanels.includes(panelKey)}
          setIsOpen={togglePanel}
          header={child.props.header}>
          {child.props.children}
        </AccordionItem>
      )
    }
    return child
  }

  return children.map((child, index) => renderItem(child, index))
}
