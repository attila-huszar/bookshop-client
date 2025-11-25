import { useLocation, useNavigate } from 'react-router'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Logo, StyledPaymentStatus, LottieWrapper } from './PaymentStatus.style'
import { usePaymentStatus } from '../../hooks/usePaymentStatus'
import logo from '@/assets/image/logo.png'
import checkmarkAnim from '@/assets/lottie/checkmark.lottie'

export function PaymentStatus() {
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const clientSecret = searchParams.get('payment_intent_client_secret')

  const { status } = usePaymentStatus(clientSecret)

  return (
    <StyledPaymentStatus>
      <Logo>
        <img src={logo} alt="logo" />
        <h1>Book Shop</h1>
      </Logo>
      {status.intent === 'succeeded' && (
        <LottieWrapper>
          <DotLottieReact src={checkmarkAnim} autoplay />
        </LottieWrapper>
      )}
      <p>{status.message}</p>
      <button onClick={() => void navigate('/')} type="button">
        Back to home
      </button>
    </StyledPaymentStatus>
  )
}
