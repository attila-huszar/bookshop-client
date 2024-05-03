import styled from 'styled-components'
import caretDown from '../../../../assets/svg/caret_down.svg'

export const StyledFilter = styled.aside`
  position: fixed;
  top: 11rem;
  right: 6rem;
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
  margin-bottom: 0.25rem;

  input {
    margin-right: 0.5rem;
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

  input {
    height: 1.25rem;
    width: 4rem;
    text-align: center;
  }
`

export const Rating = styled.div`
  display: flex;
  justify-content: space-between;

  input[type='radio'] {
    appearance: none;
    background-color: #fff;
    margin: 0;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.15em;
    border: 0.15em solid currentColor;
    border-radius: 50%;
    transform: translateY(-0.075em);
  }
`
