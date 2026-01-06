import { styled } from 'styled-components'

export const StyledPaymentStatus = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 40rem;
  margin: 2rem 0;
  padding: 2rem 6rem;
  background-color: var(--white);
  border-radius: 10px;

  p {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    text-wrap: balance;
  }
`

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: 700;

  img {
    height: auto;
    width: 4rem;
  }
`

export const LottieWrapper = styled.div`
  width: 200px;
  height: 200px;
`
