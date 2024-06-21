import { PATH } from './pathConstants'
import { cloudName } from './envVariables'

export const URL = {
  books: `${import.meta.env.VITE_SERVER_URL}/${PATH.books}`,
  authors: `${import.meta.env.VITE_SERVER_URL}/${PATH.authors}`,
  news: `${import.meta.env.VITE_SERVER_URL}/${PATH.news}`,
  users: `${import.meta.env.VITE_SERVER_URL}/${PATH.users}`,
  searchOptions: `${import.meta.env.VITE_SERVER_URL}/${PATH.searchOptions}`,
  base: import.meta.env.VITE_BASE_URL,
  verify: `${import.meta.env.VITE_BASE_URL}/${PATH.verify}`,
  cloudinaryUpload: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
  stripePaymentIntent: `${import.meta.env.VITE_LAMBDA_URL}/create-payment-intent`,
}
