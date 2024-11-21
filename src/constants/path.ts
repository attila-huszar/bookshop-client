const users = 'users'

export const PATH = {
  SERVER: {
    books: 'books',
    searchOptions: 'search_opts',
    authors: 'authors',
    news: 'news',
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
    cart: 'cart',
    checkout: 'checkout',
    orders: 'orders',
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
