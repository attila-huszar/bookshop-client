import * as Yup from 'yup'
import type { PaymentSession } from '@/types/Payment'

/** Validate a usable checkout session before accepting or storing its fields. */
export const paymentSessionSchema: Yup.ObjectSchema<PaymentSession> =
  Yup.object({
    paymentId: Yup.string().required(),
    paymentToken: Yup.string().required(),
    amount: Yup.number()
      .integer()
      .positive()
      .max(Number.MAX_SAFE_INTEGER)
      .required(),
  })
    .required()
    .strict()
