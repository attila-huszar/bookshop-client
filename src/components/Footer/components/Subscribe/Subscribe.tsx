import { SubscribeForm } from './Subscribe.styles'
import { Spacer } from '../../../../styles/Global.styles'

export function Subscribe() {
  return (
    <>
      <p>
        Subscribe to stay tuned for new product and latest updates. Let's do it!
      </p>
      <Spacer />
      <SubscribeForm>
        <input type="text" placeholder="Enter your email address" />
        <button type="button">Subscribe</button>
      </SubscribeForm>
    </>
  )
}
