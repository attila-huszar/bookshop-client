import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { getUserByEmail, postUserRegister } from '../api/fetchData'
import { IUser, IUserStore, IUserStoreState } from '../interfaces'
import { passwordEncrypt } from '../utils/passwordHash'

const initialState: IUserStoreState = {
  userData: {} as IUserStore,
  userIsLoading: false,
  userError: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(getUser.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
      })
  },
})

export const getUser = createAsyncThunk(
  'getUser',
  (user: { email: string; password: string }, { rejectWithValue }) =>
    getUserByEmail(user.email, rejectWithValue).then((response) => {
      if (response.password !== passwordEncrypt(user.password))
        throw rejectWithValue('Incorrect password')

      return response
    }),
)

export const registerUser = createAsyncThunk(
  'registerUser',
  (user: IUser, { rejectWithValue }) => postUserRegister(user, rejectWithValue),
)

export const userReducer = userSlice.reducer
