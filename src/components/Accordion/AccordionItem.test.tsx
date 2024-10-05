import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AccordionItem } from './AccordionItem'

describe('AccordionItem component', () => {
  it('should render the header and toggle content visibility when clicked', async () => {
    const mockSetIsOpen = vi.fn()

    render(
      <AccordionItem
        panelKey={1}
        isOpen={false}
        setIsOpen={mockSetIsOpen}
        header="Panel 1">
        Content 1
      </AccordionItem>,
    )

    expect(screen.getByText('Content 1')).not.toBeVisible()

    await userEvent.click(screen.getByText('Panel 1'))
    expect(mockSetIsOpen).toHaveBeenCalledWith(1)
  })

  it('should show content when isOpen is true', () => {
    render(
      <AccordionItem
        panelKey={1}
        isOpen={true}
        setIsOpen={vi.fn()}
        header="Panel 2">
        Content 2
      </AccordionItem>,
    )

    expect(screen.getByText('Content 2')).toBeVisible()
  })

  it('should hide content when isOpen is false', () => {
    render(
      <AccordionItem
        panelKey={1}
        isOpen={false}
        setIsOpen={vi.fn()}
        header="Panel 3">
        Content 3
      </AccordionItem>,
    )

    expect(screen.getByText('Content 3')).not.toBeVisible()
  })
})
