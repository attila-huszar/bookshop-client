import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState } from '@/types'

const initialState: AuthState = {
  accessToken: null,
  sessionVersion: 0,
  isRestoring: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSessionChangeStarted: (state) => {
      state.sessionVersion++
      state.isRestoring = false
    },
    authSessionChangeCompleted: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.accessToken = action.payload
      state.sessionVersion++
      state.isRestoring = false
    },
    authSessionRestorationStarted: (state) => {
      state.accessToken = null
      state.sessionVersion++
      state.isRestoring = true
    },
    authSessionRefreshed: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload
      state.isRestoring = false
    },
  },
})

export const authReducer = authSlice.reducer
export const {
  authSessionChangeCompleted,
  authSessionChangeStarted,
  authSessionRefreshed,
  authSessionRestorationStarted,
} = authSlice.actions
