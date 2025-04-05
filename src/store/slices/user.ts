import { createSlice } from '@reduxjs/toolkit'
import { login, logout, fetchUserProfile, fetchAuthTokens, updateUser } from '../thunks/user'
import type { UserState } from '@/types'

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

export const userReducer = userSlice.reducer
