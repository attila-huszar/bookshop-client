import { PATH } from '@/api/path'
import type {
  Author,
  AuthorCreate,
  AuthorReference,
  AuthorUpdate,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export const authorsApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    authorSearch: build.query<AuthorReference[], string>({
      query: (name) => ({ url: PATH.authors, searchParams: { name } }),
      providesTags: ['Author'],
    }),

    cmsAuthors: build.query<Author[], void>({
      query: () => ({ url: PATH.cms.authors, withAuth: true }),
      providesTags: ['Author'],
    }),

    addAuthor: build.mutation<Author, AuthorCreate>({
      query: (json) => ({
        url: PATH.cms.authors,
        method: 'post',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),

    updateAuthor: build.mutation<Author, AuthorUpdate>({
      query: (json) => ({
        url: PATH.cms.authors,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),

    hardDeleteAuthors: build.mutation<Author['id'][], number[]>({
      query: (authorIds) => ({
        url: PATH.cms.authors,
        method: 'delete',
        json: { authorIds },
        withAuth: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
  }),
})

export const {
  useCmsAuthorsQuery,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useHardDeleteAuthorsMutation,
} = authorsApi
