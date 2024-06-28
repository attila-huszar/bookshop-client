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

export async function sendEmail(
  to_email: string,
  to_name: string,
  code: {
    verification?: string
    passwordReset?: string
  },
) {
  const verification_link = `${URL.verify}?code=${code.verification}`
  const password_reset_link = `${URL.passwordReset}?code=${code.passwordReset}`

  try {
    const emailRes = await emailjs.send(
      emailjsService,
      (code.verification && emailjsVerificationTemplate) ||
        (code.passwordReset && emailjsResetPasswordTemplate),
      {
        to_email,
        to_name,
        link:
          (code.verification && verification_link) ||
          (code.passwordReset && password_reset_link),
        base_link: URL.base,
        from_name: 'Book Store',
      },
      optionParams,
    )

    return emailRes
  } catch (error) {
    throw error
  }
}
