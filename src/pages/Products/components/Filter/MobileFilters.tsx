import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/Button'
import { SlidersIcon, XIcon } from '@/assets/svg'
import { FilterFloatingButton } from '../../Products.style'
import { Filter } from './Filter'
import { FilterDialog, FilterDialogHeader } from './Filter.style'

export function MobileFilters() {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const dialogId = useId()
  const titleId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const closeFilters = () => dialogRef.current?.close()

  return (
    <>
      <FilterFloatingButton
        type="button"
        aria-label={t('filters.open')}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.currentTarget.focus()
          dialogRef.current?.showModal()
          setIsOpen(true)
        }}>
        <SlidersIcon aria-hidden="true" />
      </FilterFloatingButton>
      <FilterDialog
        id={dialogId}
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) {
            return
          }

          const { left, right, top, bottom } =
            event.currentTarget.getBoundingClientRect()
          const { clientX, clientY } = event

          if (
            clientX < left ||
            clientX > right ||
            clientY < top ||
            clientY > bottom
          ) {
            closeFilters()
          }
        }}>
        <FilterDialogHeader>
          <h2 id={titleId}>{t('filters.title')}</h2>
          <IconButton
            type="button"
            title={t('filters.close')}
            icon={<XIcon aria-hidden="true" />}
            onClick={closeFilters}
          />
        </FilterDialogHeader>
        <Filter onMobileClose={closeFilters} />
      </FilterDialog>
    </>
  )
}
