import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { SubscribeForm, Text } from './Subscribe.style'

export function Subscribe() {
  const [email, setEmail] = useState('')

  const handleSubscribe = () => {
    toast('Subscription feature not yet implemented', {
      icon: '💌',
    })
    setEmail('')
  }

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSubscribe} type="button">
          Subscribe
        </button>
      </SubscribeForm>
    </>
  )
}
