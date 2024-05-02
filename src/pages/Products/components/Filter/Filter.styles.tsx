import styled from 'styled-components'

export const StyledFilter = styled.aside`
  position: sticky;
  top: 11rem;
  right: 0;
  height: fit-content;
  width: 14rem;
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

  div > p {
    margin-bottom: 0.5rem;
  }

  div > div.rc-slider {
    width: auto;
    margin: 0.5rem 0.5rem 2rem;
  }

  label {
    margin: 0 1.25rem 0 0.25rem;
    font-size: 0.875rem;
  }

  span {
    font-weight: 700;
    white-space: pre;
  }
`

export const InputFields = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;

  input {
    width: 4rem;
    text-align: center;
  }
`

export const Genre = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const Rating = styled.div`
  display: flex;
  justify-content: space-between;
`
