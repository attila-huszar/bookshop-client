import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/cacheTimes'
import type {
  Book,
  BookCreate,
  BookUpdate,
  BookWithAuthorId,
  Filters,
} from '@/types'
import { bookshopApi } from './bookshopApi'
import { type BooksQueryArgs, booksSearchParams } from './booksQuery'

type SearchOptions = Pick<Filters, 'genre' | 'price' | 'publishYear'>

export const booksApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    books: build.query<{ books: Book[]; total: number }, BooksQueryArgs>({
      query: (arg) => ({
        url: PATH.books,
        searchParams: booksSearchParams(arg),
      }),
      transformResponse: (books: Book[], meta) => ({
        books,
        total: Number(meta?.response.headers.get('x-total-count') ?? 0),
      }),
      keepUnusedDataFor: CacheTime.FiveMinutes,
      providesTags: ['Book'],
    }),

    book: build.query<Book, number>({
      query: (id) => ({ url: PATH.books, searchParams: { id } }),
      keepUnusedDataFor: CacheTime.FiveMinutes,
      providesTags: ['Book'],
    }),

    booksByAuthor: build.query<Book[], number>({
      query: (authorId) => ({ url: PATH.books, searchParams: { authorId } }),
      keepUnusedDataFor: CacheTime.FiveMinutes,
      providesTags: ['Book'],
    }),

    bookSearch: build.query<Book[], string>({
      query: (title) => ({ url: PATH.books, searchParams: { title } }),
      providesTags: ['Book'],
    }),

    booksByProperty: build.query<
      Book[],
      'newRelease' | 'topSellers' | 'recommended'
    >({
      query: (property) =>
        property === 'recommended'
          ? { url: `${PATH.books}/recommended` }
          : { url: PATH.books, searchParams: { [property]: true } },
      keepUnusedDataFor: CacheTime.FifteenMinutes,
      providesTags: ['Book'],
    }),

    searchOptions: build.query<SearchOptions, void>({
      query: () => ({ url: PATH.searchOptions }),
      keepUnusedDataFor: CacheTime.OneHour,
      providesTags: ['Book'],
    }),

    cmsBooks: build.query<BookWithAuthorId[], void>({
      query: () => ({ url: PATH.cms.books, withAuth: true }),
      providesTags: ['Book'],
    }),

    addBook: build.mutation<BookWithAuthorId, BookCreate>({
      query: (json) => ({
        url: PATH.cms.books,
        method: 'post',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Book'],
    }),

    updateBook: build.mutation<BookWithAuthorId, BookUpdate>({
      query: (json) => ({
        url: PATH.cms.books,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Book'],
    }),

    hardDeleteBooks: build.mutation<BookWithAuthorId['id'][], number[]>({
      query: (bookIds) => ({
        url: PATH.cms.books,
        method: 'delete',
        json: { bookIds },
        withAuth: true,
      }),
      invalidatesTags: ['Book'],
    }),
  }),
})

export const {
  useBooksQuery,
  useBookQuery,
  useBooksByPropertyQuery,
  useSearchOptionsQuery,
  useCmsBooksQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useHardDeleteBooksMutation,
} = booksApi
