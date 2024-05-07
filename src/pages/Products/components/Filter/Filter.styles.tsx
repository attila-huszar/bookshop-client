import styled from 'styled-components'
import caretDown from '../../../../assets/svg/caret_down.svg'
import { StyleTypes } from '../../../../components/Button/Button.types'

export const StyledFilter = styled.aside`
  position: sticky;
  top: 8rem;
  right: 0;
  height: fit-content;
  width: auto;
  padding: 1rem;
  border-radius: 10px;
  background-color: var(--light-grey);
`

export const FilterOptions = styled.div`
  width: 11rem;
  user-select: none;

  & > div:not(:last-child) {
    margin-bottom: 2rem;
  }

  div > div.rc-slider {
    width: auto;
    margin: 0 0.875rem 2rem;
  }

  label {
    font-size: 0.875rem;
  }

  span {
    font-weight: 700;
    white-space: pre;
  }

  .szh-accordion__item-panel {
    padding-bottom: 1rem;

    button {
      display: block;
      margin: 0.5rem auto 0;
      border: none;
      background-color: initial;
      cursor: pointer;
    }
  }

  .szh-accordion__item-content {
    transition: height 0.25s cubic-bezier(0, 0, 0, 1);
  }

  .szh-accordion__item-btn {
    display: flex;
    width: 100%;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    background-color: initial;
    background-image: url(${caretDown});
    background-position: right center;
    background-repeat: no-repeat;
    background-size: 1rem;
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
    padding-right: 0.375rem;
    font-size: 0.75rem;
    hyphens: auto;
  }

  input {
    margin-right: 0.375rem;
  }
`

export const DiscountRadioButtons = styled.div`
  display: flex;

  input {
    margin-right: 0.5rem;
  }
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
`

export const Rating = styled.div`
  display: flex;
  justify-content: space-between;
`

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`

export const CustomButton = styled.button<StyleTypes>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 1.5rem;
  width: ${({ $inverted }) => ($inverted ? '3rem' : '6rem')};
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $inverted }) => ($inverted ? 'var(--primary-color)' : '#fff')};
  background-color: ${({ $inverted }) =>
    $inverted ? '#fff' : 'var(--primary-color)'};
  box-shadow: ${({ $shadowed }) =>
    $shadowed ? '#ffce1a50 0px 5px 10px' : undefined};
  border: none;
  border-radius: 5px;
  outline: 1px solid var(--primary-color);
  outline-offset: -1px;
  cursor: pointer;
  transition: all 0.2s ease-out;

  &:hover {
    color: ${({ $inverted }) => ($inverted ? '#fff' : 'var(--primary-color)')};
    background-color: ${({ $inverted }) =>
      $inverted ? 'var(--primary-color)' : '#fff'};
  }

  &:disabled {
    color: #fff;
    background-color: var(--primary-faded);
    outline: 1px solid var(--primary-faded);
  }
`
