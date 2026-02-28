import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAuthTokens,
  fetchUserProfile,
  login,
  logout,
  register,
  updateAvatar,
  updateUserProfile,
} from '@/store/thunks/user'
import type { UserState } from '@/types'

const initialState: UserState = {
  accessToken: null,
  userData: null,
  userIsLoading: false,
  userIsUpdating: false,
  tokenError: null,
  userError: null,
  loginError: null,
  registerError: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.loginError = null
        state.tokenError = null
      })
      .addCase(login.rejected, (state, action) => {
        state.accessToken = null
        state.loginError = action.error.message ?? 'Login failed'
      })

      .addCase(logout.fulfilled, (state) => {
        state.userData = null
        state.userError = null
        state.loginError = null
        state.registerError = null
        state.tokenError = null
        state.accessToken = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.userError = action.error.message ?? 'Logout failed'
      })

      .addCase(register.fulfilled, (state) => {
        state.registerError = null
      })
      .addCase(register.rejected, (state, action) => {
        state.registerError = action.error.message ?? 'Registration failed'
      })

      .addCase(fetchAuthTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        if (!action.payload.accessToken) {
          state.userData = null
        }
        state.tokenError = null
      })
      .addCase(fetchAuthTokens.rejected, (state, action) => {
        state.accessToken = null
        state.userData = null
        state.tokenError = action.error.message ?? 'Failed to fetch auth tokens'
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.userIsLoading = true
        state.userError = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userData = action.payload
        state.userIsLoading = false
        state.userError = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.userData = null
        state.userIsLoading = false
        state.userError = action.error.message ?? 'Failed to fetch user profile'
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.userIsUpdating = true
        state.userError = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userIsUpdating = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.userIsUpdating = false
        state.userError =
          action.error.message ?? 'Failed to update user profile'
      })

      .addCase(updateAvatar.pending, (state) => {
        state.userIsUpdating = true
        state.userError = null
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.userIsUpdating = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.userIsUpdating = false
        state.userError = action.error.message ?? 'Failed to update avatar'
      })
  },
})

export const userReducer = userSlice.reducer
