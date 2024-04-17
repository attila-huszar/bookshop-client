import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import { getUserByEmail, postUserRegister } from '../api/fetchData'
import { IUser, IUserState } from '../interfaces'
import { passwordDecrypt } from '../utils/passwordHash'

const initialState: IUserState = {
  userData: '',
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
    getUserByEmail(user.email, rejectWithValue).then((res) => {
      if (passwordDecrypt(res.password) !== user.password)
        throw rejectWithValue('Incorrect password')

      return res.uuid
    }),
)

export const registerUser = createAsyncThunk(
  'registerUser',
  (user: IUser, { rejectWithValue }) => postUserRegister(user, rejectWithValue),
)

export const userReducer = userSlice.reducer
