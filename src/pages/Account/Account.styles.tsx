import styled from 'styled-components'

export const StyledAccount = styled.main`
  padding: 0 6.25rem 4rem;

  > h2 {
    text-align: center;
    margin-bottom: 3rem;

    > span {
      font-weight: 700;
    }
  }
`

export const UserDataFields = styled.div`
  display: flex;
  font-size: 1.125rem;

  div:not(:last-child) {
    border-right: 2px solid grey;
  }
`

export const BaseDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 50%;

  > div {
    display: flex;
    gap: 1rem;
  }
`

export const OtherDetails = styled.div`
  padding: 0 2rem;
`
