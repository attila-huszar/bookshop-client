import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { SerializedError } from '@reduxjs/toolkit'
import { getUserByEmail, getUserByUUID, putUser } from 'api'
import { passwordEncrypt } from 'helpers'
import { IUserUpdate, IUserStore, IUserToStore } from 'interfaces'

const initialState: IUserStore = {
  userData: null,
  userIsLoading: false,
  userIsUpdating: false,
  userError: null,
  loginError: null,
  registerError: null,
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
        state.loginError = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.loginError = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userIsLoading = false
        state.loginError = action.payload as SerializedError
        state.userData = null
      })

      .addCase(updateUser.pending, (state) => {
        state.userIsUpdating = true
        state.userError = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userIsUpdating = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userIsUpdating = false
        state.userError = action.payload as SerializedError
        state.userData = null
      })

      .addCase(fetchUserByUUID.pending, (state) => {
        state.userIsLoading = true
        state.userError = null
      })
      .addCase(fetchUserByUUID.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(fetchUserByUUID.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
        state.userData = null
      })
  },
})

export const loginUser = createAsyncThunk(
  'loginUser',
  (
    user: { email: string; password: string },
    { rejectWithValue },
  ): Promise<IUserToStore> =>
    getUserByEmail(user.email).then((response) => {
      if (
        response &&
        response.verified &&
        response.password === passwordEncrypt(user.password)
      ) {
        const {
          password,
          verificationCode,
          verificationCodeExpiresAt,
          ...userToStore
        } = response

        return userToStore
      } else if (response && !response.verified) {
        throw rejectWithValue('Please verify your email first')
      } else {
        throw rejectWithValue('User email or password is incorrect')
      }
    }),
)

export const fetchUserByUUID = createAsyncThunk(
  'fetchUserByUUID',
  (uuid: string, { rejectWithValue }): Promise<IUserToStore> =>
    getUserByUUID(uuid, rejectWithValue).then((response) => {
      if (response) {
        const {
          password,
          verificationCode,
          verificationCodeExpiresAt,
          ...userToStore
        } = response

        return userToStore
      } else {
        throw rejectWithValue('User not found')
      }
    }),
)

export const updateUser = createAsyncThunk(
  'updateUser',
  async (
    { uuid, fields }: IUserUpdate,
    { rejectWithValue },
  ): Promise<IUserToStore> => {
    const userResponse = await getUserByUUID(uuid, rejectWithValue)

    if (userResponse) {
      const updatedUser = await putUser(
        { ...userResponse, ...fields, updatedAt: new Date() },
        rejectWithValue,
      )

      const {
        password,
        verificationCode,
        verificationCodeExpiresAt,
        ...userToStore
      } = updatedUser

      return userToStore
    } else {
      throw rejectWithValue('User not found')
    }
  },
)

export const userReducer = userSlice.reducer
export const { logoutUser } = userSlice.actions
