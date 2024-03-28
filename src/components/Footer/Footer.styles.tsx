import styled from 'styled-components'

export const StyledFooter = styled.footer`
  position: absolute;
  bottom: 0;
  display: grid;
  grid-template-rows: 1fr 3.5rem;
  grid-template-columns: 1fr 1fr;
  height: 25rem;
  width: 100%;
  max-width: 90rem;
  padding: 0 6.25rem;
`

export const StDiv1 = styled.div`
  grid-area: 1 / 1 / 2 / 2;
  padding: 3rem 0;
`

export const StDiv2 = styled.div`
  grid-area: 1 / 2 / 2 / 3;
  padding: 4.75rem 2.5rem;
`

export const StDiv3 = styled.div`
  grid-area: 2 / 1 / 3 / 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px #0d08421a solid;
`

export const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style-type: none;
`

export const SocialsList = styled.div`
  display: flex;
  gap: 3rem;
`

export const Spacer = styled.div`
  height: 3rem;
`

export const SubscribeForm = styled.form`
  display: flex;
  margin-top: 0.5rem;
  border: 2px solid var(--generalColor);
  border-radius: 10px;
  overflow: hidden;

  input {
    flex-grow: 2;
    padding: 0.5rem 2rem;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    color: #6c6c6c;
  }

  input:focus {
    outline: none;
  }

  form:focus-within {
    outline: 2px solid var(--favoriteColor);
  }

  button {
    padding: 0.5rem 2rem;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    background-color: var(--generalColor);
  }
`
