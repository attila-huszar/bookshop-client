import styled from 'styled-components'

export const CustomSelectButton = styled.button<{
  $valid: boolean
  $error: boolean | string | undefined
  $disabled?: boolean
}>`
  width: 100%;
  padding: 0.75rem 0.75rem;
  padding-right: ${({ $disabled }) => ($disabled ? '0.75rem' : '3.5rem')};
  font-size: 1rem;
  border: 1px solid lightgrey;
  border-radius: 5px;
  background-color: #fff;
  text-align: left;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &:focus,
  &:active {
    border: 1px solid rgb(26, 33, 43);
    box-shadow:
      rgb(210, 213, 217) 0px 0px 2px 1px,
      rgb(227, 230, 232) 0px 0px 0px 3px;
    outline: none;
  }

  ${({ $valid }) =>
    $valid &&
    `
    border: 1px solid rgb(0, 156, 38);
    outline: none;
    
    &:focus,
    &:active {
      border: 1px solid rgb(0, 156, 38);
      box-shadow:
        rgb(106, 237, 97) 0px 0px 2px 1px,
        rgb(177, 247, 160) 0px 0px 0px 3px;
      outline: none;
    }
  `}

  ${({ $error }) =>
    $error &&
    `
    border: 1px solid rgb(191, 49, 12);
    outline: none;

    &:focus,
    &:active {
      border: 1px solid rgb(191, 49, 12);
      box-shadow:
        rgb(244, 129, 116) 0px 0px 2px 1px,
        rgb(251, 178, 174) 0px 0px 0px 3px;
      outline: none;
    }
  `}

  ${({ $disabled }) =>
    $disabled &&
    `
    color: var(--black);
    background-color: var(--whitesmoke);
  `}
`

export const DropdownList = styled.ul<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid lightgrey;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  list-style: none;
  margin: 0;
  padding: 0;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`

export const DropdownItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:first-child {
    border-radius: 5px 5px 0 0;
  }

  &:last-child {
    border-radius: 0 0 5px 5px;
  }
`

export const FlagImage = styled.img`
  width: 24px;
  height: 18px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  flex-shrink: 0;
`

export const SelectedFlag = styled(FlagImage)`
  flex-shrink: 0;
`

export const ChevronIcon = styled.span<{ $isOpen: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%)
    ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s;
  pointer-events: none;
  font-size: 0.75rem;
  color: var(--grey);
`
