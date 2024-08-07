import emailjs from '@emailjs/browser'
import {
  emailjsKey,
  emailjsService,
  emailjsVerificationTemplate,
  emailjsResetPasswordTemplate,
  URL,
} from 'lib'

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
    verification: emailjsVerificationTemplate as string,
    passwordReset: emailjsResetPasswordTemplate as string,
  }

  const links = {
    verification: `${URL.verify}?code=${code.verification}`,
    passwordReset: `${URL.passwordReset}?code=${code.passwordReset}`,
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
    base_link: URL.base,
    from_name: 'Book Store',
  }

  return emailjs.send(emailjsService, templateId, templateParams, optionParams)
}
