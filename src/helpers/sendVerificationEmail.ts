import emailjs from '@emailjs/browser'
import { emailjsKey, emailjsService, emailjsTemplate, URL } from 'lib'

const optionParams = {
  publicKey: emailjsKey,
  blockHeadless: true,
  limitRate: {
    throttle: 10000,
  },
}

export async function sendVerificationEmail(
  to_email: string,
  to_name: string,
  verificationCode: string,
) {
  const verification_link = `${URL.verify}?code=${verificationCode}`

  try {
    const emailRes = await emailjs.send(
      emailjsService,
      emailjsTemplate,
      {
        to_email,
        to_name,
        verification_link,
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
