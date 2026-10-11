import { styled } from 'styled-components'

export const StyledNotFound = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: -5rem 0 5rem;
`

export const ImageWrapper = styled.div`
  margin: 0 auto;
`

export const NotFoundSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: 14rem;
    line-height: normal;
    color: var(--color-primary);
  }

  h3 {
    font-size: 2rem;
    line-height: normal;
  }

  h4 {
    margin: 1.5rem 0;
    font-size: 1.5rem;
    line-height: normal;
    color: var(--color-on-surface-variant);
  }
`

export const BackButton = styled.button`
  width: fit-content;
  padding: 0 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  border: none;
  background: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s ease-out;

  &:hover:not(:disabled) {
    background-color: var(--color-surface-container-high);
  }
`
