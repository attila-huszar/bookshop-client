const enum P {
  books = 'books',
  authors = 'authors',
  news = 'news',
  searchOptions = 'search_opts',
  users = 'users',
  orders = 'orders',
  cms = 'cms',
}

const createUserEndpoints = (base: string) => ({
  register: `${base}/register`,
  login: `${base}/login`,
  logout: `${base}/logout`,
  verification: `${base}/verification`,
  passwordResetRequest: `${base}/password-reset-request`,
  passwordResetToken: `${base}/password-reset-token`,
  passwordResetSubmit: `${base}/password-reset-submit`,
  profile: `${base}/profile`,
  refresh: `${base}/refresh`,
  avatar: `${base}/avatar`,
  country: `${base}/country`,
  countryCodes: `${base}/country-codes`,
})

const createOrderEndpoints = (base: string) => ({
  base,
  paymentIntents: `${base}/payment-intents`,
})

export const PATH = {
  books: P.books,
  authors: P.authors,
  news: P.news,
  searchOptions: P.searchOptions,
  users: createUserEndpoints(P.users),
  orders: createOrderEndpoints(P.orders),
  cms: {
    orders: `${P.cms}/${P.orders}`,
    users: `${P.cms}/${P.users}`,
    books: `${P.cms}/${P.books}`,
    authors: `${P.cms}/${P.authors}`,
    productImage: `${P.cms}/product-image`,
  },
} as const
