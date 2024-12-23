import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  retrieveAuthTokens,
  getUserProfile,
  postUserLogin,
  postUserLogout,
  patchUserProfile,
} from '@/api/users'
import { handleErrors } from '@/errors'
import type { UserUpdate, UserState, User } from '@/types'

const initialState: UserState = {
  accessToken: null,
  userData: null,
  userIsLoading: false,
  userIsUpdating: false,
  tokenError: undefined,
  userError: undefined,
  loginError: undefined,
  registerError: undefined,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.loginError = undefined
      })
      .addCase(login.rejected, (state, action) => {
        state.accessToken = null
        state.loginError = action.payload
      })

      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null
        state.userData = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.userError = action.payload
      })

      .addCase(fetchAuthTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload
        state.tokenError = undefined
      })
      .addCase(fetchAuthTokens.rejected, (state, action) => {
        state.tokenError = action.payload
        state.accessToken = null
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userData = action.payload
        state.userIsLoading = false
        state.userError = undefined
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.userData = null
        state.userIsLoading = false
        state.userError = action.payload
      })

      .addCase(updateUser.pending, (state) => {
        state.userIsUpdating = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userIsUpdating = false
        state.userData = action.payload
        state.userError = undefined
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userIsUpdating = false
        state.userError = action.payload
        state.userData = null
      })
  },
})

export const fetchAuthTokens = createAsyncThunk<string, void, RejectValue>(
  'fetchAuthTokens',
  async (_, { rejectWithValue }) => {
    try {
      const { accessToken } = await retrieveAuthTokens()

      return accessToken
    } catch (error) {
      const errorObject = handleErrors(error, 'Unable to get auth tokens')

      return rejectWithValue(errorObject.message)
    }
  },
)

export const fetchUserProfile = createAsyncThunk<User, void, RejectValue>(
  'fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userResponse = await getUserProfile()

      return userResponse
    } catch (error) {
      const errorObject = handleErrors(error, 'Unable to get user profile')

      return rejectWithValue(errorObject.message)
    }
  },
)

export const login = createAsyncThunk<
  { accessToken: string; firstName: string },
  { email: string; password: string },
  RejectValue
>('login', async (user, { rejectWithValue }) => {
  try {
    const userResponse = await postUserLogin(user.email, user.password)

    return userResponse
  } catch (error) {
    const errorObject = handleErrors(
      error,
      'Login failed, please try again later',
    )

    return rejectWithValue(errorObject.message)
  }
})

export const logout = createAsyncThunk<{ message: string }, void, RejectValue>(
  'authLogout',
  async (_, { rejectWithValue }) => {
    try {
      const userResponse = await postUserLogout()

      return userResponse
    } catch (error) {
      const errorObject = handleErrors(
        error,
        'Logout failed, please try again later',
      )

      return rejectWithValue(errorObject.message)
    }
  },
)

export const updateUser = createAsyncThunk<User, UserUpdate, RejectValue>(
  'updateUser',
  async (fields: UserUpdate, { rejectWithValue }) => {
    try {
      const userResponse = await patchUserProfile(fields)

      return userResponse
    } catch (error) {
      const errorObject = handleErrors(
        error,
        'User update failed, please try again later',
      )

      return rejectWithValue(errorObject.message)
    }
  },
)

export const userReducer = userSlice.reducer
