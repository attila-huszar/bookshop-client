import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserProfile, postUserLogin } from '@/api/users'
import { IUser, IUserUpdate, IStateUser } from '@/interfaces'

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
    setAccessToken: (state, action: { payload: string }) => {
      state.accessToken = action.payload
    },
    setUserData: (state, action: { payload: IUser }) => {
      state.userData = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.loginError = undefined
      })
      .addCase(login.rejected, (state, action) => {
        state.accessToken = null
        state.loginError = action.error.message
      })

      .addCase(userProfile.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(userProfile.fulfilled, (state, action) => {
        state.userData = action.payload
        state.userIsLoading = false
        state.userError = undefined
      })
      .addCase(userProfile.rejected, (state, action) => {
        state.userData = null
        state.userIsLoading = false
        state.userError = action.error.message
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

export const userProfile = createAsyncThunk('userProfile', async () => {
  const userResponse = await getUserProfile()

  return userResponse
})

export const login = createAsyncThunk(
  'login',
  async (user: { email: string; password: string }) => {
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
