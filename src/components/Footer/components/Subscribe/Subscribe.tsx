import { Text, SubscribeForm } from './Subscribe.style'

export function Subscribe() {
  return (
    <>
      <Text>
        Subscribe to stay tuned for new product and latest updates. Let's do it!
      </Text>
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
