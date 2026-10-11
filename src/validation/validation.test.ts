import { describe, expect, it } from 'vitest'
import { orderSchema } from './orderSchemas'
import { authorSchema, bookSchema } from './productSchemas'
import {
  forgotPasswordSchema,
  nameSchema,
  registrationSchema,
  searchSchema,
  userCreateSchema,
  userSchema,
} from './userSchemas'

const user = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  country: 'hu',
  phone: '',
  avatar: '',
  address: null,
  role: 'user',
}
const item = {
  id: 1,
  title: 'Book',
  author: null,
  price: 10,
  discount: 0,
  quantity: 1,
}
const order = {
  firstName: null,
  lastName: null,
  email: null,
  shipping: null,
  items: [item],
  total: 10,
  currency: 'USD',
  paymentStatus: 'processing',
}

describe('form validation', () => {
  it('accepts international names and punctuation while sharing trimming and length limits', async () => {
    for (const name of ['李', 'O’Connor', 'Anne-Marie', 'محمد']) {
      expect(await nameSchema.validate(` ${name} `)).toBe(name)
      expect(
        await orderSchema.isValid({
          ...order,
          firstName: name,
          lastName: name,
        }),
      ).toBe(true)
      expect(
        await registrationSchema.isValid({
          ...user,
          firstName: name,
          lastName: name,
          password: 'password123',
          passwordConfirmation: 'password123',
          avatar: null,
        }),
      ).toBe(true)
    }
    expect(await nameSchema.validate(' Jane ')).toBe('Jane')
    expect(await nameSchema.isValid(' ')).toBe(false)
    expect(
      await orderSchema.isValid({ ...order, firstName: 'A'.repeat(100) }),
    ).toBe(true)
    expect(await nameSchema.isValid('A'.repeat(101))).toBe(false)
    for (const value of [null, undefined, '']) {
      expect(await nameSchema.isValid(value)).toBe(false)
      expect(
        await orderSchema.isValid({
          ...order,
          firstName: value,
          lastName: value,
        }),
      ).toBe(true)
    }
    for (const field of ['firstName', 'lastName']) {
      expect(
        await orderSchema.isValid({ ...order, [field]: 'A'.repeat(101) }),
      ).toBe(false)
    }
  })

  it('validates the object values used by forgot-password and search forms', async () => {
    await expect(
      forgotPasswordSchema.validate({ email: ' jane@example.com ' }),
    ).resolves.toEqual({ email: 'jane@example.com' })
    await expect(searchSchema.validate({ search: ' books ' })).resolves.toEqual(
      { search: 'books' },
    )
    await expect(
      forgotPasswordSchema.validate({ email: 'invalid' }),
    ).rejects.toThrow()
    await expect(searchSchema.validate({ search: '  ' })).rejects.toThrow()
  })

  it('accepts guest orders with missing personal and shipping details', async () => {
    expect(await orderSchema.isValid(order)).toBe(true)
    expect(
      await orderSchema.isValid({
        ...order,
        firstName: '李',
        shipping: { address: { country: 'JP' } },
      }),
    ).toBe(true)
  })

  it('rejects invalid order items, amounts, currency, and status', async () => {
    for (const fields of [
      { items: [] },
      { items: [{ ...item, quantity: 0 }] },
      { items: [{ ...item, quantity: 100000 }] },
      { total: -1 },
      { currency: 'invalid' },
      { paymentStatus: 'paid' },
    ]) {
      expect(await orderSchema.isValid({ ...order, ...fields })).toBe(false)
    }
  })

  it('allows CMS users without address or phone and requires a password only on create', async () => {
    expect(await userSchema.isValid(user)).toBe(true)
    expect(
      await userSchema.isValid({ ...user, address: { city: '', country: '' } }),
    ).toBe(true)
    expect(await userCreateSchema.isValid(user)).toBe(false)
    expect(
      await userCreateSchema.isValid({ ...user, password: 'password123' }),
    ).toBe(true)
    expect(await userCreateSchema.isValid({ ...user, password: 'weak' })).toBe(
      false,
    )
    expect(await userSchema.isValid({ ...user, phone: 'invalid' })).toBe(false)
  })

  it('rejects blank registration names and nonletter country codes', async () => {
    const registration = {
      ...user,
      password: 'password123',
      passwordConfirmation: 'password123',
      avatar: null,
    }
    expect(await registrationSchema.isValid(registration)).toBe(true)
    expect(
      await registrationSchema.isValid({ ...registration, firstName: ' ' }),
    ).toBe(false)
    expect(
      await registrationSchema.isValid({ ...registration, country: '12' }),
    ).toBe(false)
  })

  it('requires a positive author ID and an integer publication year', async () => {
    const book = {
      title: 'Book',
      authorId: 1,
      publishYear: 2020,
      description: 'A long book description',
      genre: 'Fiction',
      imgUrl: 'https://example.com/book.jpg',
      price: 10,
      rating: 4.5,
    }
    expect(await bookSchema.isValid(book)).toBe(true)
    expect(await bookSchema.isValid({ ...book, authorId: 0 })).toBe(false)
    expect(await bookSchema.isValid({ ...book, publishYear: 2020.5 })).toBe(
      false,
    )
  })

  it('allows unknown author details while validating supplied years', async () => {
    const author = {
      name: 'An Author',
      fullName: '',
      biography: '',
      homeland: '',
      birthYear: '',
      deathYear: '',
    }
    expect(await authorSchema.isValid(author)).toBe(true)
    expect(await authorSchema.isValid({ ...author, birthYear: '-10' })).toBe(
      false,
    )
    expect(await authorSchema.isValid({ ...author, deathYear: '2020.5' })).toBe(
      false,
    )
  })
})
