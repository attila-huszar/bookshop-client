import * as Yup from 'yup'
import { i18n } from '@/i18n'
import { maxItemQuantity } from '@/constants/defaultValues'
import {
  emailSchema,
  nameSchema,
  optionalAddressSchema,
  phoneSchema,
} from './userSchemas'
import './locale'

export const itemQuantitySchema = Yup.number()
  .integer(() => i18n.t('validation.integer'))
  .positive(() => i18n.t('validation.positive'))
  .max(maxItemQuantity)
  .required(() => i18n.t('validation.required'))

export const orderItemSchema = Yup.object().shape({
  id: Yup.number()
    .integer()
    .positive()
    .max(Number.MAX_SAFE_INTEGER)
    .required(() => i18n.t('validation.required')),
  title: Yup.string().required(() => i18n.t('validation.required')),
  author: Yup.string().nullable(),
  price: Yup.number()
    .positive(() => i18n.t('validation.positive'))
    .required(() => i18n.t('validation.required')),
  discount: Yup.number()
    .min(0, () => i18n.t('validation.minimum', { min: '0%' }))
    .max(100, () => i18n.t('validation.maximum', { max: '100%' }))
    .required(() => i18n.t('validation.required')),
  quantity: itemQuantitySchema,
})

export const storedCartSchema = Yup.array()
  .of(orderItemSchema.pick(['id', 'quantity']).exact().required())
  .required()
  .strict()

export const orderSchema = Yup.object().shape({
  firstName: nameSchema.notRequired(),
  lastName: nameSchema.notRequired(),
  email: emailSchema.nullable().notRequired(),
  shipping: Yup.object()
    .shape({
      name: Yup.string().trim().max(200).optional(),
      address: optionalAddressSchema,
      phone: phoneSchema.nullable().optional(),
    })
    .nullable()
    .default(undefined)
    .optional(),
  items: Yup.array()
    .of(orderItemSchema)
    .min(1)
    .required(() => i18n.t('validation.orderItems')),
  total: Yup.number().min(0).required(),
  currency: Yup.string()
    .matches(/^[A-Za-z]{3}$/)
    .required(),
  paymentStatus: Yup.string()
    .oneOf([
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
      'succeeded',
    ])
    .required(),
})

export const orderCustomerUpdateSchema = orderSchema.pick([
  'firstName',
  'lastName',
  'email',
  'shipping',
])
