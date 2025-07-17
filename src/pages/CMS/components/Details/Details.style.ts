import styled from 'styled-components'

export const StyledDetails = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid var(--light-grey);
  border-radius: 10px;
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

export const CheckboxRow = styled(FormRow)`
  > :not(:first-child) {
    align-content: center;
  }

  > p {
    margin-left: 2rem;
  }
`

export const FormButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`
