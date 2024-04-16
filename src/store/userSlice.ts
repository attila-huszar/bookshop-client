import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { fetchUser } from '../api/fetchData'
import { IUserState } from '../interfaces'

const initialState: IUserState = {
  userData: {
    uuid: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  },
  userIsLoading: false,
  userError: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
      })
  },
})

export const fetchUserById = createAsyncThunk(
  'fetchUserById',
  (id: string, { rejectWithValue }) => fetchUser(id, rejectWithValue),
)

export const userReducer = userSlice.reducer
