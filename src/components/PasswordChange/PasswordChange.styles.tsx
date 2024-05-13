import styled from 'styled-components'

export const StyledPasswordChange = styled.section`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);

  h2 {
    margin-bottom: 2rem;
  }

  > form {
    width: 20rem;

    > div {
      margin-bottom: 1rem;
    }
  }
`
