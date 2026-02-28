import { styled } from 'styled-components'
import { media } from '@/styles'

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
    text-wrap: pretty;
  }

  ${media.down('sm')`
    width: 100%;
    padding: 2rem 1.5rem;

    p {
      font-size: 1rem;
    }
  `}
`

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;

  img {
    height: auto;
    width: 4rem;
  }

  ${media.down('sm')`
    font-size: 1rem;

    img {
      width: 3rem;
    }
  `}
`

export const LottieWrapper = styled.div`
  width: 200px;
  height: 200px;

  ${media.down('sm')`
    width: 150px;
    height: 150px;
  `}
`
