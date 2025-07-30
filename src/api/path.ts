const enum P {
  books = 'books',
  authors = 'authors',
  news = 'news',
  searchOptions = 'search_opts',
  users = 'users',
  orders = 'orders',
  upload = 'upload',
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
})

const createOrderEndpoints = (base: string) => ({
  paymentIntent: `${base}/payment-intent`,
  create: `${base}/create`,
  update: `${base}/update`,
})

const createCmsEndpoints = (base: string) => ({
  list: `${base}/list`,
  create: `${base}/create`,
  update: `${base}/update`,
  delete: `${base}/delete`,
})

export const PATH = {
  books: P.books,
  authors: P.authors,
  news: P.news,
  searchOptions: P.searchOptions,
  users: createUserEndpoints(P.users),
  orders: createOrderEndpoints(P.orders),
  upload: P.upload,
  cms: {
    orders: createCmsEndpoints(`${P.cms}/${P.orders}`),
    users: createCmsEndpoints(`${P.cms}/${P.users}`),
    books: createCmsEndpoints(`${P.cms}/${P.books}`),
    authors: createCmsEndpoints(`${P.cms}/${P.authors}`),
  },
} as const
