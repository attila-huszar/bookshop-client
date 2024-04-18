import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import {
  getUserByEmail,
  getUserByUUID,
  postUserRegister,
} from '../api/fetchData'
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
  reducers: {
    logoutUser: (state) => {
      state.userData = {} as IUserStore
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
      })
  },
})

export const loginUser = createAsyncThunk(
  'loginUser',
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

export const getUserByID = createAsyncThunk(
  'getUserByID',
  (uuid: string, { rejectWithValue }) =>
    getUserByUUID(uuid, rejectWithValue).then((res) => res),
)

export const userReducer = userSlice.reducer
export const { logoutUser } = userSlice.actions
