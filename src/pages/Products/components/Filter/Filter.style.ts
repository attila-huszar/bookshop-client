import { css, styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { media } from '@/styles/media.breakpoints'

const filterSurface = css`
  padding: 0.375rem;
  border-radius: 10px;
  background-color: var(--color-surface-container-high);
`

export const StyledFilter = styled.aside`
  ${filterSurface}
  position: sticky;
  top: 7.5rem;
  align-self: start;
`

export const FilterDialog = styled.dialog`
  ${filterSurface}
  position: fixed;
  inset: auto 1rem 5rem auto;
  width: min(20rem, calc(100% - 2rem));
  max-height: 70dvh;
  margin: 0;
  border: 0;
  color: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
  box-shadow: var(--shadow-raised);

  &::backdrop {
    background-color: var(--color-backdrop);
  }
`

export const FilterDialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 0.5rem;

  h2 {
    font-size: 1.125rem;
    font-weight: 700;
  }
`

export const FilterOptions = styled.div`
  width: 12rem;
  user-select: none;

  ${media.down('sm')`
    width: auto;
  `}

  & > div:not(:last-child) {
    margin-bottom: 2rem;
  }

  div > div.rc-slider {
    width: auto;
    margin: 0.375rem 0.875rem 2rem;
  }

  label {
    font-size: 0.875rem;
  }

  span {
    font-weight: 700;
    white-space: pre;
  }
`

export const GenreCheckBoxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.5rem;

  & > div {
    display: flex;
    align-items: center;
    width: 50%;
  }

  label {
    margin-right: 0.375rem;
    font-size: 0.75rem;
    hyphens: auto;
  }

  input {
    margin-right: 0.375rem;
  }

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const DiscountRadioButtons = styled.div`
  display: flex;

  input {
    margin-right: 0.5rem;
  }

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const InputFields = styled.div`
  display: flex;
  justify-content: space-between;
  height: 1.25rem;
  line-height: normal;

  input {
    width: 4rem;
    text-align: center;
  }

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const Rating = styled.div`
  display: flex;
  justify-content: space-between;

  ${media.down('sm')`
    padding-inline: 0.25rem;
  `}
`

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`

export const CustomButton = styled(StyledButton)`
  flex: 1;
  min-width: 0;
  min-height: 1.5rem;
  padding-block: 0.125em;
  width: auto;
  font-size: 0.75rem;
`

export const ClearSelectionButton = styled(CustomButton)`
  width: fit-content;
  margin: 0.5rem auto 0.375rem;
`
