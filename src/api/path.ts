const users = 'users'
const books = 'books'
const orders = 'orders'
const cms = 'cms'

export const PATH = {
  books: books,
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
    passwordResetSubmit: `${users}/password-reset-submit`,
    profile: `${users}/profile`,
    refresh: `${users}/refresh`,
  },
  orders: {
    paymentIntent: `${orders}/payment-intent`,
    create: `${orders}/create`,
    update: `${orders}/update`,
  },
  upload: 'upload',
  cms: {
    orders: { all: `${cms}/${orders}/all` },
    users: { all: `${cms}/${users}/all` },
    books: { all: `${cms}/${books}/all`, add: `${cms}/${books}/add` },
    authors: { all: `${cms}/authors/all` },
  },
} as const
