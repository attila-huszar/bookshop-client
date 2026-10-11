import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserState } from '@/types'

const initialState: UserState = {
  accessToken: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authSessionChanged: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload
    },
  },
})

export const userReducer = userSlice.reducer
export const { authSessionChanged } = userSlice.actions
