import * as Yup from 'yup'
import {
  emailSchema,
  phoneSchema,
  addressSchema,
  nameSchema,
} from './userSchemas'
import { OrderStatus } from '@/types'

export const orderStatusSchema = Yup.string()
  .oneOf(Object.values(OrderStatus), 'Invalid order status')
  .required('Required')

export const orderItemSchema = Yup.object().shape({
  id: Yup.number().integer().positive().required('Required'),
  title: Yup.string().required('Required'),
  price: Yup.number().positive('Must be positive').required('Required'),
  discount: Yup.number()
    .min(0, 'Min 0%')
    .max(100, 'Max 100%')
    .required('Required'),
  quantity: Yup.number()
    .integer('Must be integer')
    .positive('Must be positive')
    .required('Required'),
})

export const orderSchema = Yup.object().shape({
  orderStatus: orderStatusSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: addressSchema,
  items: Yup.array().of(orderItemSchema).required(),
})
