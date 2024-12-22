const users = 'users'
const orders = 'orders'

export const PATH = {
  SERVER: {
    books: 'books',
    authors: 'authors',
    news: 'news',
    searchOptions: 'search_opts',
    users: {
      register: `${users}/register`,
      login: `${users}/login`,
      logout: `${users}/logout`,
      verification: `${users}/verification`,
      passwordResetRequest: `${users}/password-reset-request`,
      passwordResetToken: `${users}/password-reset-token`,
      profile: `${users}/profile`,
      refresh: `${users}/refresh`,
    },
    orders: {
      paymentIntent: `${orders}/payment-intent`,
      create: `${orders}/create`,
      update: `${orders}/update`,
    },
  },
  CLIENT: {
    books: 'books',
    login: 'login',
    register: 'register',
    verification: 'verification',
    passwordReset: 'password-reset',
    account: 'account',
    cart: 'cart',
    checkout: 'checkout',
    orders: 'orders',
  },
} as const
