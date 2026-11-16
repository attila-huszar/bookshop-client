import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/AppToaster'
import { SubscribeForm, Text } from './Subscribe.style'

export function Subscribe() {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')

  const handleSubscribe = () => {
    toast(t('home.subscribeUnavailable'), {
      icon: '💌',
    })
    setEmail('')
  }

  return (
    <>
      <Text>{t('home.subscribeDescription')}</Text>
      <SubscribeForm>
        <input
          name="subscribe"
          type="email"
          placeholder={t('home.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSubscribe} type="button">
          {t('home.subscribe')}
        </button>
      </SubscribeForm>
    </>
  )
}
