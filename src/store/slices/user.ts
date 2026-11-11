import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserState } from '@/types'

const initialState: UserState = {
  accessToken: null,
  sessionVersion: 0,
  isRestoring: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authSessionChanged: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload
      state.sessionVersion++
      state.isRestoring = false
    },
    authSessionRestoring: (state) => {
      state.accessToken = null
      state.sessionVersion++
      state.isRestoring = true
    },
    authTokenRefreshed: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload
      state.isRestoring = false
    },
  },
})

export const userReducer = userSlice.reducer
export const { authSessionChanged, authSessionRestoring, authTokenRefreshed } =
  userSlice.actions
