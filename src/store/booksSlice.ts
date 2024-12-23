import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import {
  getBookById,
  getBooks,
  getBooksByAuthor,
  getBooksByProperty,
  getBooksBySearch,
  getBookSearchOptions,
} from '@/api'
import { generateUniqueRndNums } from '@/helpers'
import { RootState } from './store'
import type { Book, BookState, FilterProps, FilterActive } from '@/types'

const initialState: BookState = {
  booksInShop: [],
  booksViewed: [],
  booksTotal: 0,
  booksCurrentPage: 1,
  booksPerPage: 8,
  bookIsLoading: false,
  booksAreLoading: false,
  booksError: undefined,
  booksFilters: {
    initial: {
      genre: [],
      price: [],
      discount: 'allBooks',
      publishYear: [],
      rating: 0.5,
    },
    active: {
      genre: [],
      price: [],
      discount: 'allBooks',
      publishYear: [],
      rating: 0.5,
    },
  },
  booksRecommended: [],
  booksTopSellers: [],
  booksReleases: [],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    incrementBooksCurrentPage: (state) => {
      state.booksCurrentPage += 1
    },
    decrementBooksCurrentPage: (state) => {
      state.booksCurrentPage -= 1
    },
    setBooksCurrentPage: (state, action: PayloadAction<number>) => {
      state.booksCurrentPage = action.payload
    },
    setBooksFilterGenre: (state, action) => {
      if (typeof action.payload === 'string') {
        const genreIdx = state.booksFilters.active.genre.indexOf(action.payload)

        if (genreIdx !== -1) {
          state.booksFilters.active.genre.splice(genreIdx, 1)
        } else {
          state.booksFilters.active.genre.push(action.payload)
        }
      } else {
        state.booksFilters.active.genre = []
      }
    },
    setBooksFilterPrice: (
      state,
      action: PayloadAction<FilterProps['price']>,
    ) => {
      if (action.payload.length) {
        state.booksFilters.active.price = action.payload
      } else {
        state.booksFilters.active.price = state.booksFilters.initial.price
      }
    },
    setBooksFilterDiscount: (
      state,
      action: PayloadAction<FilterProps['discount']>,
    ) => {
      state.booksFilters.active.discount = action.payload
    },
    setBooksFilterPublishYear: (
      state,
      action: PayloadAction<FilterProps['publishYear']>,
    ) => {
      if (action.payload.length) {
        state.booksFilters.active.publishYear = action.payload
      } else {
        state.booksFilters.active.publishYear =
          state.booksFilters.initial.publishYear
      }
    },
    setBooksFilterRating: (
      state,
      action: PayloadAction<FilterProps['rating']>,
    ) => {
      state.booksFilters.active.rating = action.payload
    },
  },
  extraReducers: (builder) => {
    const handleViewedBooks = (
      state: { booksViewed: Book[] },
      action: { payload: Book[] },
    ) => {
      action.payload.forEach((newBook) => {
        if (
          !state.booksViewed.some(
            (existingBook) => existingBook.id === newBook.id,
          )
        ) {
          state.booksViewed.push(newBook)
        }
      })
    }

    builder
      .addCase(fetchBooks.pending, (state) => {
        state.booksError = undefined
        state.booksAreLoading = true
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksInShop = action.payload.books
        state.booksTotal = action.payload.total
        state.booksError = undefined
        state.booksAreLoading = false
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksError = action.error.message
        state.booksAreLoading = false
      })
      .addCase(fetchBookById.pending, (state) => {
        state.booksError = undefined
        state.bookIsLoading = true
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        const bookExists = state.booksViewed.some(
          (book) => book.id === action.payload?.id,
        )
        if (!bookExists && action.payload) {
          state.booksViewed.push(action.payload)
        }
        state.booksError = undefined
        state.bookIsLoading = false
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.error.message
        state.bookIsLoading = false
      })
      .addCase(fetchBooksByProperty.fulfilled, (state, action) => {
        if (action.meta.arg === 'topSellers') {
          state.booksTopSellers = action.payload
        } else if (action.meta.arg === 'newRelease') {
          state.booksReleases = action.payload
        }
      })
      .addCase(fetchBooksBySearch.fulfilled, handleViewedBooks)
      .addCase(fetchBooksByAuthor.fulfilled, handleViewedBooks)
      .addCase(fetchRecommendedBooks.fulfilled, (state, action) => {
        state.booksRecommended = action.payload
      })
      .addCase(fetchBookSearchOptions.fulfilled, (state, action) => {
        state.booksFilters.initial = {
          ...state.booksFilters.initial,
          ...action.payload,
        }
        state.booksFilters.active.price = action.payload.price
        state.booksFilters.active.publishYear = action.payload.publishYear
      })
  },
})

export const fetchBooks = createAsyncThunk(
  'fetchBooks',
  (optionalFilters: FilterProps | undefined, { getState }) => {
    const {
      books: {
        booksCurrentPage: currentPage,
        booksPerPage: itemsPerPage,
        booksFilters: { active, initial },
      },
    } = getState() as RootState

    const isFilterActive: { [key in keyof FilterActive]: boolean } = {
      genre: active.genre.length > 0,
      priceMin: active.price[0] !== initial.price[0],
      priceMax: active.price[1] !== initial.price[1],
      discount: active.discount !== initial.discount,
      publishYearMin: active.publishYear[0] !== initial.publishYear[0],
      publishYearMax: active.publishYear[1] !== initial.publishYear[1],
      rating: active.rating !== initial.rating,
    }

    const hasAnyFilter = Object.values(isFilterActive).some(Boolean)

    const criteria: FilterActive | undefined =
      optionalFilters && hasAnyFilter
        ? {
            genre: isFilterActive.genre ? optionalFilters.genre : [],
            priceMin: isFilterActive.priceMin ? optionalFilters.price[0] : null,
            priceMax: isFilterActive.priceMax ? optionalFilters.price[1] : null,
            discount: isFilterActive.discount
              ? optionalFilters.discount
              : 'allBooks',
            publishYearMin: isFilterActive.publishYearMin
              ? optionalFilters.publishYear[0]
              : null,
            publishYearMax: isFilterActive.publishYearMax
              ? optionalFilters.publishYear[1]
              : null,
            rating: isFilterActive.rating ? optionalFilters.rating : 0.5,
          }
        : undefined

    return getBooks({ currentPage, itemsPerPage, criteria })
  },
)

export const fetchBookById = createAsyncThunk('fetchBookById', getBookById)

export const fetchBooksBySearch = createAsyncThunk(
  'fetchBooksBySearch',
  getBooksBySearch,
)

export const fetchBooksByAuthor = createAsyncThunk(
  'fetchBooksByAuthor',
  getBooksByAuthor,
)

export const fetchBooksByProperty = createAsyncThunk(
  'fetchBooksByProperty',
  getBooksByProperty,
)

export const fetchRecommendedBooks = createAsyncThunk(
  'fetchRecommendedBooks',
  async (count: number, { getState }) => {
    const state = getState() as RootState
    const totalBooks: number = state.books.booksTotal
    const randomBooks: Book[] = []
    const randomIdxs = generateUniqueRndNums(count, totalBooks)

    for (const idx of randomIdxs) {
      const book = await getBookById(idx)
      if (book) {
        randomBooks.push(book)
      }
    }
    return randomBooks
  },
)

export const fetchBookSearchOptions = createAsyncThunk(
  'fetchBookSearchOptions',
  getBookSearchOptions,
)

export const booksReducer = booksSlice.reducer
export const {
  incrementBooksCurrentPage,
  decrementBooksCurrentPage,
  setBooksCurrentPage,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} = booksSlice.actions
