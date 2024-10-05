import { styled } from 'styled-components'

export const StyledInfoDialog = styled.dialog`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: none;
  outline: none;
  border-radius: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;

  &::backdrop {
    background: rgba(0, 0, 0, 0.35);
  }

  > button {
    height: 2.5rem !important;
    width: 12rem !important;
    padding: 0 !important;
    margin: 0 auto 2rem !important;
    font-family: 'Montserrat', sans-serif !important;
    font-size: 0.875rem !important;
    font-weight: 700 !important;
    color: #fff !important;
    background: var(--primary-color) !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 10px !important;
    outline: 3px solid var(--primary-color) !important;
    outline-offset: -3px !important;
    cursor: pointer;
    transition: all 0.2s ease-out;
  }

  > button:hover {
    color: var(--primary-color) !important;
    background-color: #fff !important;
    filter: none !important;
  }
`
