import { PATH } from './path'
import { cloudinaryName } from 'services'

export const URL = {
  books: `${import.meta.env.VITE_SERVER_URL}/${PATH.books}`,
  authors: `${import.meta.env.VITE_SERVER_URL}/${PATH.authors}`,
  news: `${import.meta.env.VITE_SERVER_URL}/${PATH.news}`,
  users: `${import.meta.env.VITE_SERVER_URL}/${PATH.users}`,
  searchOptions: `${import.meta.env.VITE_SERVER_URL}/${PATH.searchOptions}`,
  orders: `${import.meta.env.VITE_SERVER_URL}/${PATH.orders}`,
  base: import.meta.env.VITE_BASE_URL,
  verify: `${import.meta.env.VITE_BASE_URL}/${PATH.verify}`,
  passwordReset: `${import.meta.env.VITE_BASE_URL}/${PATH.passwordReset}`,
  cloudinaryUpload: `https://api.cloudinary.com/v1_1/${cloudinaryName}/upload`,
  stripePaymentIntent: `${import.meta.env.VITE_STRIPE_CLOUD_FUNCTION_URL}/create-payment-intent`,
}
