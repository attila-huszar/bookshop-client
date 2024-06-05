import styled from 'styled-components'

export const StyledAccount = styled.main`
  padding: 0 6.25rem 4rem;

  > h2 {
    text-align: center;
    margin-bottom: 2rem;

    > span {
      font-weight: 700;
    }
  }
`

export const UserDataFields = styled.div`
  font-size: 1.125rem;
`

export const Details = styled.div`
  position: relative;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--light-grey);
  border-radius: 10px;
  background-color: var(--whitesmoke);

  > h5 {
    margin-bottom: 1rem;
  }

  > div {
    display: flex;
  }

  > button {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
`

export const AvatarPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`

export const General = styled.div`
  margin-left: 2rem;
  width: 100%;
`

export const GeneralLine = styled.div`
  display: flex;
  gap: 3rem;

  > div {
    width: 100%;
    margin-bottom: 1rem;
  }
`

export const Address = styled.div`
  > form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  input[name='number'] {
    width: 10rem;
  }

  input[name='state'] {
    width: 20rem;
  }

  input[name='postCode'] {
    width: 10rem;
  }

  select[name='country'] {
    width: 20rem;
    padding-right: 2.25rem;
    appearance: none;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" fill="dimgray"/></svg>');
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--black);
  }

  select[name='country']:disabled {
    color: var(--black);
  }

  select[name='country'],
  select[name='country'] > option {
    font-family: 'Noto Color Emoji', 'Montserrat', sans-serif;
  }

  option[hidden] {
    color: var(--grey);
  }
`

export const AddressLine = styled.div`
  display: flex;
  gap: 3rem;

  > div:first-child {
    width: 100%;
  }

  > div:not(:last-child) {
    margin-bottom: 1rem;
  }

  > div:last-child {
    width: auto;
  }
`

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  display: flex;
  gap: 1rem;
`
