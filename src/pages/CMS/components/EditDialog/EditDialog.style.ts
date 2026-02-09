import { styled } from 'styled-components'

export const StyledEditDialog = styled.dialog`
  position: fixed;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80%;
  width: 80%;
  min-width: 40rem;
  max-width: 100rem;
  padding: 1.125rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: var(--white);
  box-shadow: var(--shadow);
`

export const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`

export const DefaultRow = styled(FormRow)`
  > div {
    flex-grow: 1;
  }

  > div.centered-checkbox {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

export const TitleRow = styled(FormRow)`
  > div:not(:nth-child(3)) {
    flex-grow: 1;
  }

  select[name='authorId'] {
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

  input[name='publishYear'] {
    width: 5rem;
  }
`

export const GenreRow = styled(FormRow)`
  > div:first-child {
    flex-grow: 1;
  }

  input[name='rating'] {
    width: 5rem;
  }
`

export const ItemRow = styled(FormRow)`
  > div:not(:first-child) {
    flex-grow: 1;
  }

  > div:first-child {
    width: 5rem;
  }
`

export const SettingsRow = styled(FormRow)`
  > div:first-child {
    flex-grow: 1;
  }

  > div:nth-child(2) {
    justify-items: center;

    button {
      transform: translateY(1.75rem);
    }
  }

  > div:nth-child(3),
  > div:nth-child(4) {
    text-align: center;

    input {
      transform: translateY(0.75rem) scale(1.5);
    }
  }
`

export const FormButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

export const AddressBlock = styled.div`
  padding: 0.25rem 0.5rem 0;
  border: 1px solid var(--light-grey);
  border-radius: 5px;
  margin-bottom: 1rem;

  > p {
    margin-bottom: 0.5rem;
  }
`

export const ItemBlock = styled.div`
  padding: 0.25rem 0.5rem 0;
  border: 1px solid var(--light-grey);
  border-radius: 5px;
  margin-bottom: 1rem;

  > p {
    margin-bottom: 0.5rem;
  }

  > div:not(:last-child) {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--light-grey);
  }
`

export const SectionHeader = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  margin: 1rem 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--light-grey);
`

export const MetadataBlock = styled.div`
  padding: 0.75rem;
  background: var(--whitesmoke);
  border-radius: 5px;
  margin-bottom: 1rem;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;

  > div {
    > p {
      font-size: 0.75rem;
      font-weight: 600;
      color: #888;
      margin-bottom: 0.25rem;
    }

    > span {
      font-size: 0.875rem;
      color: var(--black);
      word-break: break-all;
    }
  }
`
