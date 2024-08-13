import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction, SerializedError } from '@reduxjs/toolkit'
import {
  getBooks,
  getBookById,
  getBooksByAuthor,
  getBooksByProperty,
  getBooksBySearch,
  getBookSearchOptions,
} from 'api'
import { generateUniqueRndNums } from 'helpers'
import { RootState } from './store'
import { IBook, IBookStore, IFilter, IFilterApplied } from 'interfaces'

const initialState: IBookStore = {
  booksInShop: [],
  booksViewed: [],
  booksTotal: 0,
  booksCurrentPage: 1,
  booksPerPage: 8,
  booksAreLoading: false,
  booksError: null,
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
    setBooksCurrentPage: (state, action) => {
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
    setBooksFilterPrice: (state, action) => {
      if (action.payload.length) {
        state.booksFilters.active.price = action.payload
      } else {
        state.booksFilters.active.price = state.booksFilters.initial.price
      }
    },
    setBooksFilterDiscount: (
      state,
      action: PayloadAction<IFilter['discount']>,
    ) => {
      state.booksFilters.active.discount = action.payload
    },
    setBooksFilterPublishYear: (state, action) => {
      if (action.payload.length) {
        state.booksFilters.active.publishYear = action.payload
      } else {
        state.booksFilters.active.publishYear =
          state.booksFilters.initial.publishYear
      }
    },
    setBooksFilterRating: (state, action: PayloadAction<IFilter['rating']>) => {
      state.booksFilters.active.rating = action.payload
    },
  },
  extraReducers: (builder) => {
    const handleViewedBooks = (
      state: { booksViewed: IBook[] },
      action: { payload: IBook[] },
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
        state.booksAreLoading = true
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksInShop = action.payload.books
        state.booksTotal = Number(action.payload.total)
        state.booksAreLoading = false
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
        state.booksAreLoading = false
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        const bookExists = state.booksViewed.some(
          (book) => book.id === action.payload.id,
        )
        if (!bookExists) {
          state.booksViewed.push(action.payload)
        }
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.booksError = action.payload as SerializedError
      })
      .addCase(fetchBooksBySearch.fulfilled, handleViewedBooks)
      .addCase(fetchBooksByAuthor.fulfilled, handleViewedBooks)
      .addCase(fetchBookSearchOptions.fulfilled, (state, action) => {
        state.booksFilters.initial = {
          ...state.booksFilters.initial,
          ...action.payload,
        }
        state.booksFilters.active.price = action.payload.price
        state.booksFilters.active.publishYear = action.payload.publishYear
      })
      .addCase(fetchBooksByProperty.fulfilled, (state, action) => {
        if (action.meta.arg === 'topSellers') {
          state.booksTopSellers = action.payload
        } else if (action.meta.arg === 'new') {
          state.booksReleases = action.payload
        }
      })
      .addCase(fetchRecommendedBooks.fulfilled, (state, action) => {
        state.booksRecommended = action.payload
      })
  },
})

export const fetchBooks = createAsyncThunk(
  'fetchBooks',
  (optionalFilters: IFilter | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const _page: number = state.books.booksCurrentPage
    const _limit: number = state.books.booksPerPage
    const activeFilters = state.books.booksFilters.active
    const initialFilters = state.books.booksFilters.initial

    const filtersApplied: { [key in keyof IFilterApplied]: boolean } = {
      genre: activeFilters.genre.length > 0,
      priceMin: activeFilters.price[0] !== initialFilters.price[0],
      priceMax: activeFilters.price[1] !== initialFilters.price[1],
      discount: activeFilters.discount !== initialFilters.discount,
      publishYearMin:
        activeFilters.publishYear[0] !== initialFilters.publishYear[0],
      publishYearMax:
        activeFilters.publishYear[1] !== initialFilters.publishYear[1],
      rating: activeFilters.rating !== initialFilters.rating,
    }

    const criteria: IFilterApplied | undefined = optionalFilters
      ? {
          genre: filtersApplied.genre ? optionalFilters.genre : [],
          priceMin: filtersApplied.priceMin ? optionalFilters.price[0] : null,
          priceMax: filtersApplied.priceMax ? optionalFilters.price[1] : null,
          discount: filtersApplied.discount
            ? optionalFilters.discount
            : 'allBooks',
          publishYearMin: filtersApplied.publishYearMin
            ? optionalFilters.publishYear[0]
            : null,
          publishYearMax: filtersApplied.publishYearMax
            ? optionalFilters.publishYear[1]
            : null,
          rating: filtersApplied.rating ? optionalFilters.rating : 0.5,
        }
      : undefined

    return getBooks({ _page, _limit, criteria }, rejectWithValue)
  },
)

export const fetchBookById = createAsyncThunk(
  'fetchBookById',
  (id: number, { rejectWithValue }) => getBookById(id, rejectWithValue),
)

export const fetchBooksBySearch = createAsyncThunk(
  'fetchBooksBySearch',
  (searchString: string, { rejectWithValue }) =>
    getBooksBySearch(searchString, rejectWithValue),
)

export const fetchBooksByAuthor = createAsyncThunk(
  'fetchBooksByAuthor',
  (authorId: number, { rejectWithValue }) =>
    getBooksByAuthor(authorId, rejectWithValue),
)

export const fetchBookSearchOptions = createAsyncThunk(
  'fetchBookSearchOptions',
  (_, { rejectWithValue }) => getBookSearchOptions(rejectWithValue),
)

export const fetchBooksByProperty = createAsyncThunk(
  'fetchBooksByProperty',
  (property: string, { rejectWithValue }) =>
    getBooksByProperty(property, rejectWithValue),
)

export const fetchRecommendedBooks = createAsyncThunk(
  'fetchRecommendedBooks',
  async (count: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const totalBooks: number = state.books.booksTotal
    const randomBooks: IBook[] = []

    if (totalBooks) {
      const randomIdxs = generateUniqueRndNums(count, totalBooks)

      for (const idx of randomIdxs) {
        const book = await getBookById(idx, rejectWithValue)
        randomBooks.push(book)
      }
    }

    return randomBooks
  },
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
