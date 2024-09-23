import { send } from '@emailjs/browser'
import {
  baseURL,
  emailjsKey,
  emailjsService,
  emailjsVerificationTemplate,
  emailjsResetPasswordTemplate,
  PATH,
} from '@/constants'

const optionParams = {
  publicKey: emailjsKey,
  blockHeadless: true,
  limitRate: {
    throttle: 10000,
  },
}

export function sendEmail(
  to_email: string,
  to_name: string,
  code: {
    verification?: string
    passwordReset?: string
  },
) {
  const emailTemplates = {
    verification: emailjsVerificationTemplate,
    passwordReset: emailjsResetPasswordTemplate,
  }

  const links = {
    verification: `${baseURL}/${PATH.verify}?code=${code.verification}`,
    passwordReset: `${baseURL}/${PATH.passwordReset}?code=${code.passwordReset}`,
  }

  const [key] = Object.keys(code) as (keyof typeof code)[]
  const templateId = emailTemplates[key]
  const link = links[key]

  if (!templateId || !link) {
    throw new Error('Unable to send email')
  }

  const templateParams = {
    to_email,
    to_name,
    link,
    base_link: baseURL,
    from_name: 'Book Shop',
  }

  return send(emailjsService, templateId, templateParams, optionParams)
}
