import { useRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useClickOutside } from './useClickOutside'

function Menu(props: {
  onOutsideClick: () => void
  includeSecondary?: boolean
}) {
  const primaryRef = useRef<HTMLDivElement>(null)
  const secondaryRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    props.includeSecondary ? [primaryRef, secondaryRef] : primaryRef,
    props.onOutsideClick,
  )

  return (
    <>
      <div ref={primaryRef}>
        <button>Primary</button>
      </div>
      <div ref={secondaryRef}>
        <button>Secondary</button>
      </div>
      <button>Outside</button>
    </>
  )
}

function Dialog(props: { onOutsideClick: () => void; open: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useClickOutside(ref, props.onOutsideClick)

  return (
    <dialog ref={ref} open={props.open}>
      <button>Inside dialog</button>
    </dialog>
  )
}

describe('useClickOutside', () => {
  it('uses the latest callback and refs without reconnecting its listener', () => {
    const originalCallback = vi.fn()
    const latestCallback = vi.fn()
    const addListener = vi.spyOn(document, 'addEventListener')
    const { rerender, unmount } = render(
      <Menu onOutsideClick={originalCallback} />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Primary' }))
    expect(originalCallback).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Secondary' }))
    expect(originalCallback).toHaveBeenCalledTimes(1)

    rerender(<Menu onOutsideClick={latestCallback} includeSecondary />)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Secondary' }))
    expect(latestCallback).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))
    expect(latestCallback).toHaveBeenCalledTimes(1)
    expect(
      addListener.mock.calls.filter(([event]) => event === 'pointerdown'),
    ).toHaveLength(1)

    unmount()
    fireEvent.pointerDown(document.body)
    expect(latestCallback).toHaveBeenCalledTimes(1)
  })

  it('ignores outside clicks while a dialog is closed', () => {
    const onOutsideClick = vi.fn()
    render(<Dialog onOutsideClick={onOutsideClick} open={false} />)

    fireEvent.pointerDown(document.body)

    expect(onOutsideClick).not.toHaveBeenCalled()
  })

  it('distinguishes clicks in dialog content and padding from its backdrop', () => {
    const onOutsideClick = vi.fn()
    render(<Dialog onOutsideClick={onOutsideClick} open />)
    const dialog = screen.getByRole('dialog')
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(100, 100, 200, 200),
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Inside dialog' }))
    fireEvent.pointerDown(dialog, { clientX: 150, clientY: 150 })
    expect(onOutsideClick).not.toHaveBeenCalled()

    fireEvent.pointerDown(dialog, { clientX: 50, clientY: 150 })
    expect(onOutsideClick).toHaveBeenCalledTimes(1)
  })
})
