import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserByEmail, getUserByUUID, putUser } from 'api'
import { passwordEncrypt } from 'helpers'
import { IUserUpdate, IUserStore, IUserToStore } from 'interfaces'

const initialState: IUserStore = {
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
        state.loginError = undefined
      })
      .addCase(loginUser.rejected, (state, action) => {
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

      .addCase(fetchUserByUUID.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(fetchUserByUUID.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = undefined
      })
      .addCase(fetchUserByUUID.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.error.message
        state.userData = null
      })
  },
})

export const loginUser = createAsyncThunk(
  'loginUser',
  async (user: { email: string; password: string }): Promise<IUserToStore> => {
    const userResponse = await getUserByEmail(user.email)

    if (
      userResponse?.verified &&
      userResponse?.password === passwordEncrypt(user.password)
    ) {
      const {
        password,
        verificationCode,
        verificationCodeExpiresAt,
        ...userToStore
      } = userResponse

      return userToStore
    } else if (userResponse?.verified === false) {
      throw new Error('Please verify your email address first')
    } else {
      throw new Error('User email or password is incorrect')
    }
  },
)

export const fetchUserByUUID = createAsyncThunk(
  'fetchUserByUUID',
  async (uuid: string): Promise<IUserToStore> => {
    const userResponse = await getUserByUUID(uuid)

    const {
      password,
      verificationCode,
      verificationCodeExpiresAt,
      ...userToStore
    } = userResponse

    return userToStore
  },
)

export const updateUser = createAsyncThunk(
  'updateUser',
  async ({ uuid, fields }: IUserUpdate): Promise<IUserToStore> => {
    const userResponse = await getUserByUUID(uuid)
    const updatedUser = await putUser({
      ...userResponse,
      ...fields,
      updatedAt: new Date(),
    })

    const {
      password,
      verificationCode,
      verificationCodeExpiresAt,
      ...userToStore
    } = updatedUser

    return userToStore
  },
)

export const userReducer = userSlice.reducer
export const { logoutUser } = userSlice.actions
