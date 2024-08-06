import { SubscribeForm } from './Subscribe.styles'

export function Subscribe() {
  return (
    <>
      <p>
        {
          "Subscribe to stay tuned for new product and latest updates. Let's do it!"
        }
      </p>
      <SubscribeForm>
        <input
          name="subscribe"
          type="email"
          placeholder="Enter your email address"
        />
        <button type="button">Subscribe</button>
      </SubscribeForm>
    </>
  )
}
