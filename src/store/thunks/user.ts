import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  retrieveAuthTokens,
  getUserProfile,
  postUserLogin,
  postUserLogout,
  patchUserProfile,
  uploadAvatar,
} from '@/api'
import type { UserUpdate, User, LoginRequest, LoginResponse } from '@/types'

export const fetchAuthTokens = createAsyncThunk<string, void>(
  'user/fetchAuthTokens',
  async () => {
    const { accessToken } = await retrieveAuthTokens()
    return accessToken
  },
)

export const fetchUserProfile = createAsyncThunk<User, void>(
  'user/fetchUserProfile',
  async () => {
    return await getUserProfile()
  },
)

export const login = createAsyncThunk<LoginResponse, LoginRequest>(
  'user/login',
  async ({ email, password }) => {
    return await postUserLogin({ email, password })
  },
)

export const logout = createAsyncThunk<{ message: string }, void>(
  'user/logout',
  async () => {
    return await postUserLogout()
  },
)

export const updateUser = createAsyncThunk<User, UserUpdate>(
  'user/updateUser',
  async (fields: UserUpdate) => {
    return await patchUserProfile(fields)
  },
)

export const updateAvatar = createAsyncThunk<User, FormData>(
  'user/updateAvatar',
  async (formData: FormData) => {
    return await uploadAvatar(formData)
  },
)
