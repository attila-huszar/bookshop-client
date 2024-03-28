import { SubscribeForm } from './Subscribe.styles'

export function Subscribe() {
  return (
    <>
      <p>
        Subscribe to stay tuned for new product and latest updates. Let's do it!
      </p>
      <SubscribeForm>
        <input type="text" placeholder="Enter your email address" />
        <button type="button">Subscribe</button>
      </SubscribeForm>
    </>
  )
}
