import { styled } from 'styled-components'
import { StyleTypes } from '@/components/Button/Button.types'

export const StyledFilter = styled.aside`
  position: sticky;
  top: 7.5rem;
  bottom: 0;
  height: fit-content;
  width: auto;
  padding: 0.375rem;
  border-radius: 10px;
  background-color: var(--light-grey);
`

export const FilterOptions = styled.div`
  width: 12rem;
  user-select: none;

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
  margin-bottom: 0.5rem;
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
  box-shadow: ${({ $shadow }) =>
    $shadow ? '#ffce1a50 0px 5px 10px' : undefined};
  border: none;
  border-radius: var(--border-radius);
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
