import { isValidElement, ReactElement, useState } from 'react'
import { AccordionItem, AccordionItemProps } from './AccordionItem'

type Props = {
  defaultOpenPanels?: number[]
  numberOfAllowedOpenPanels?: number | 'all'
  children: ReactElement<AccordionItemProps>[]
}

export function Accordion({
  defaultOpenPanels = [0],
  numberOfAllowedOpenPanels = 'all',
  children,
}: Props) {
  const [openPanels, setOpenPanels] = useState(defaultOpenPanels)

  const togglePanel = (panelKey: number) => {
    setOpenPanels((prevState) => {
      const newPanelsOpen = [...prevState]

      if (newPanelsOpen.includes(panelKey)) {
        newPanelsOpen.splice(newPanelsOpen.indexOf(panelKey), 1)
      } else {
        if (
          typeof numberOfAllowedOpenPanels === 'number' &&
          newPanelsOpen.length > numberOfAllowedOpenPanels - 1
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
