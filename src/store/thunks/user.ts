import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  retrieveAuthTokens,
  getUserProfile,
  postUserLogin,
  postUserLogout,
  patchUserProfile,
} from '@/api/users'
import type { UserUpdate, User, LoginRequest, LoginResponse } from '@/types'

export const fetchAuthTokens = createAsyncThunk<string, void, RejectValue>(
  'user/fetchAuthTokens',
  async (_, { rejectWithValue }) => {
    try {
      const { accessToken } = await retrieveAuthTokens()

      return accessToken
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred',
      )
    }
  },
)

export const fetchUserProfile = createAsyncThunk<User, void, RejectValue>(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userResponse = await getUserProfile()

      return userResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred',
      )
    }
  },
)

export const login = createAsyncThunk<LoginResponse, LoginRequest, RejectValue>(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userResponse = await postUserLogin({
        email,
        password,
      })

      return userResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred',
      )
    }
  },
)

export const logout = createAsyncThunk<{ message: string }, void, RejectValue>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const userResponse = await postUserLogout()

      return userResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred',
      )
    }
  },
)

export const updateUser = createAsyncThunk<User, UserUpdate, RejectValue>(
  'user/updateUser',
  async (fields: UserUpdate, { rejectWithValue }) => {
    try {
      const userResponse = await patchUserProfile(fields)

      return userResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unknown error occurred',
      )
    }
  },
)
