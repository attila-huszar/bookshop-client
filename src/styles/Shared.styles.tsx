import styled from 'styled-components'

export const Strikethrough = styled.span`
  position: relative;
  margin-left: 2rem;
  font-size: inherit;
  color: var(--textGreyColor);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 1ch);
    border-bottom: 1px solid;
    pointer-events: none;
  }
`
