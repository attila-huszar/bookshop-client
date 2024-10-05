import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

describe('Accordion component', () => {
  it('should display and limit open panels based on numberOfAllowedOpenPanels', async () => {
    render(
      <Accordion numberOfAllowedOpenPanels={1}>
        <AccordionItem header="Panel 1">Content 1</AccordionItem>
        <AccordionItem header="Panel 2">Content 2</AccordionItem>
        <AccordionItem header="Panel 3">Content 3</AccordionItem>
      </Accordion>,
    )

    expect(screen.getByText('Content 1')).toBeVisible()
    expect(screen.getByText('Content 2')).not.toBeVisible()
    expect(screen.getByText('Content 3')).not.toBeVisible()

    await userEvent.click(screen.getByText('Panel 2'))
    expect(screen.getByText('Content 1')).not.toBeVisible()
    expect(screen.getByText('Content 2')).toBeVisible()

    await userEvent.click(screen.getByText('Panel 3'))
    expect(screen.getByText('Content 2')).not.toBeVisible()
    expect(screen.getByText('Content 3')).toBeVisible()
  })
})
