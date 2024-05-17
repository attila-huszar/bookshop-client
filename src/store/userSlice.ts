import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit'
import {
  getUserByEmail,
  getUserByUUID,
  postUserImg,
  postUserRegister,
  putUser,
} from '../api/fetchData'
import { passwordEncrypt } from '../utils'
import { IUser, IUserUpdate, IUserStore } from '../interfaces'

const initialState: IUserStore = {
  userData: null,
  userIsVerified: false,
  userIsLoading: false,
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
      .addCase(registerUser.pending, (state) => {
        state.userIsLoading = true
        state.registerError = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userIsVerified = true
        state.registerError = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.userIsLoading = false
        state.userIsVerified = false
        state.registerError = action.payload as SerializedError
      })

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
        state.userIsLoading = true
        state.userError = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
        state.userData = null
      })

      .addCase(getUserByID.pending, (state) => {
        state.userIsLoading = true
        state.userError = null
      })
      .addCase(getUserByID.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(getUserByID.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
        state.userData = null
      })
  },
})

export const loginUser = createAsyncThunk(
  'loginUser',
  (user: { email: string; password: string }, { rejectWithValue }) =>
    getUserByEmail(user.email, rejectWithValue).then((response) => {
      if (response && response.password === passwordEncrypt(user.password)) {
        const { password, ...userWithoutPassword } = response
        return userWithoutPassword
      } else {
        throw rejectWithValue('Username or password is incorrect')
      }
    }),
)

export const registerUser = createAsyncThunk(
  'registerUser',
  async (user: IUser, { rejectWithValue }) => {
    const response = await getUserByEmail(user.email, rejectWithValue)

    if (!response) {
      if (user.avatar instanceof File) {
        const imageResponse = await postUserImg(user.avatar, rejectWithValue)
        user.avatar = imageResponse.url
      }

      const registerResponse = await postUserRegister(user, rejectWithValue)
      const { password, ...userWithoutPassword } = registerResponse
      return userWithoutPassword
    } else if (response.email === user.email) {
      throw rejectWithValue(`${user.email} is already taken!`)
    } else {
      throw rejectWithValue('Registration Failed')
    }
  },
)

export const getUserByID = createAsyncThunk(
  'getUserByID',
  (uuid: string, { rejectWithValue }) =>
    getUserByUUID(uuid, rejectWithValue).then((response) => {
      if (response) {
        const { password, ...userWithoutPassword } = response
        return userWithoutPassword
      } else {
        throw rejectWithValue('User not found')
      }
    }),
)

export const uploadImage = createAsyncThunk(
  'uploadImage',
  (file: File, { rejectWithValue }) =>
    postUserImg(file, rejectWithValue).then((imageResponse) => {
      if (imageResponse.url) {
        return imageResponse
      } else {
        throw rejectWithValue('Image upload failed')
      }
    }),
)

export const updateUser = createAsyncThunk(
  'updateUser',
  async ({ uuid, field, value }: IUserUpdate, { rejectWithValue }) => {
    const userResponse = await getUserByUUID(uuid, rejectWithValue)

    if (userResponse) {
      const updatedUser = await putUser(
        { ...userResponse, [field]: value },
        rejectWithValue,
      )

      const { password, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    } else {
      throw rejectWithValue('User not found')
    }
  },
)

export const userReducer = userSlice.reducer
export const { logoutUser } = userSlice.actions
