import * as Yup from 'yup'
import { maxItemQuantity } from '@/constants/defaultValues'
import {
  emailSchema,
  nameSchema,
  optionalAddressSchema,
  phoneSchema,
} from './userSchemas'

export const orderItemSchema = Yup.object().shape({
  id: Yup.number().integer().positive().required('Required'),
  title: Yup.string().required('Required'),
  author: Yup.string().nullable(),
  price: Yup.number().positive('Must be positive').required('Required'),
  discount: Yup.number()
    .min(0, 'Min 0%')
    .max(100, 'Max 100%')
    .required('Required'),
  quantity: Yup.number()
    .integer('Must be integer')
    .positive('Must be positive')
    .max(maxItemQuantity)
    .required('Required'),
})

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
    .required('Order items are required'),
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
