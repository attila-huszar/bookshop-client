import { styled } from 'styled-components'

export const StyledCMS = styled.section`
  min-width: var(--min-width);
  max-width: var(--max-width);
  margin: 0 auto;
`

export const MainContainer = styled.div`
  position: relative;
  padding: 1.5rem;
  border-radius: 20px;
  background: var(--white);
  box-shadow: var(--shadow);
`

export const MenuButtons = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  gap: 0.5rem;
`

export const BackToMain = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
`
