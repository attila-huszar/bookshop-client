import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  getUserProfile,
  patchUserProfile,
  postUserLogin,
  postUserLogout,
  postUserRegister,
  retrieveAuthTokens,
  uploadAvatar,
} from '@/api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UserUpdate,
} from '@/types'

export const fetchAuthTokens = createAsyncThunk<
  { accessToken: string | null },
  void
>('user/fetchAuthTokens', () => retrieveAuthTokens())

export const fetchUserProfile = createAsyncThunk<User, void>(
  'user/fetchUserProfile',
  () => getUserProfile(),
)

export const login = createAsyncThunk<LoginResponse, LoginRequest>(
  'user/login',
  ({ email, password }) => postUserLogin({ email, password }),
)

export const register = createAsyncThunk<RegisterResponse, RegisterRequest>(
  'user/register',
  (user: RegisterRequest) => postUserRegister(user),
)

export const logout = createAsyncThunk<{ success: boolean }, void>(
  'user/logout',
  () => postUserLogout(),
)

export const updateUserProfile = createAsyncThunk<User, UserUpdate>(
  'user/updateUserProfile',
  (fields: UserUpdate) => patchUserProfile(fields),
)

export const updateAvatar = createAsyncThunk<User, FormData>(
  'user/updateAvatar',
  (formData: FormData) => uploadAvatar(formData),
)
