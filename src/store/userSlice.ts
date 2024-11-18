import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { IUserUpdate, IStateUser } from '@/interfaces'
import { postUserLogin } from '@/api/users'

const initialState: IStateUser = {
  accessToken: null,
  userData: null,
  userIsLoading: false,
  userIsUpdating: false,
  userError: undefined,
  loginError: undefined,
  registerError: undefined,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = null
      state.userData = null
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    setUserData: (state, action) => {
      state.userData = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.accessToken = action.payload.accessToken
        state.loginError = undefined
      })
      .addCase(login.rejected, (state, action) => {
        state.userIsLoading = false
        state.loginError = action.error.message
        state.userData = null
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
        state.userError = action.error.message
        state.userData = null
      })
  },
})

export const login = createAsyncThunk(
  'login',
  async (user: {
    email: string
    password: string
  }): Promise<{ accessToken: string; firstName: string }> => {
    const userResponse = await postUserLogin(user.email, user.password)

    return userResponse
  },
)

export const updateUser = createAsyncThunk(
  'updateUser',
  async ({ email, fields }: IUserUpdate) => {},
)

export const userReducer = userSlice.reducer
export const { setAccessToken, setUserData, logout } = userSlice.actions
