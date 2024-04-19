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
import { IUser, IUserStoreState } from '../interfaces'
import { passwordEncrypt } from '../utils/passwordHash'

const initialState: IUserStoreState = {
  userData: null,
  userIsLoading: false,
  userError: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.userData = null
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
      .addCase(getUserByID.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(getUserByID.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(getUserByID.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
      })
  },
})

export const loginUser = createAsyncThunk(
  'loginUser',
  (user: { email: string; password: string }, { rejectWithValue }) =>
    getUserByEmail(user.email, rejectWithValue).then((response) => {
      if (response && response.password === passwordEncrypt(user.password)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPass } = response
        return userWithoutPass
      } else {
        throw rejectWithValue('Username or password is incorrect')
      }
    }),
)

export const registerUser = createAsyncThunk(
  'registerUser',
  async (user: IUser, { rejectWithValue }) => {
    const response = await getUserByEmail(user.email, rejectWithValue)

    if (!response) {
      const registerResponse = await postUserRegister(user, rejectWithValue)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPass } = registerResponse
      return userWithoutPass
    } else if (response.email === user.email) {
      throw rejectWithValue(`${user.email} is already registered!`)
    } else {
      throw rejectWithValue('Something went wrong')
    }
  },
)

export const getUserByID = createAsyncThunk(
  'getUserByID',
  (uuid: string, { rejectWithValue }) =>
    getUserByUUID(uuid, rejectWithValue).then((response) => {
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPass } = response

        return userWithoutPass
      } else {
        throw rejectWithValue('User not found')
      }
    }),
)

export const userReducer = userSlice.reducer
export const { logoutUser } = userSlice.actions
