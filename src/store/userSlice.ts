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
import { IUser, IUserStoreState } from '../interfaces'
import { passwordEncrypt } from '../utils/passwordHash'

const initialState: IUserStoreState = {
  userData: null,
  userIsLoading: false,
  userError: null,
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
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
      })
      .addCase(getUserByID.pending, (state) => {
        state.userIsLoading = true
      })
      .addCase(getUserByID.fulfilled, (state, action) => {
        state.userIsLoading = false
        state.userData = action.payload
        state.userError = null
      })
      .addCase(getUserByID.rejected, (state, action) => {
        state.userIsLoading = false
        state.userError = action.payload as SerializedError
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.userData = action.payload
      })
  },
})

export const loginUser = createAsyncThunk(
  'loginUser',
  (user: { email: string; password: string }, { rejectWithValue }) =>
    getUserByEmail(user.email, rejectWithValue).then((response) => {
      if (response && response.password === passwordEncrypt(user.password)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      const registerResponse = await postUserRegister(user, rejectWithValue)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = registerResponse
      return userWithoutPassword
    } else if (response.email === user.email) {
      throw rejectWithValue(`${user.email} is already taken!`)
    } else {
      throw rejectWithValue('Something went wrong')
    }
  },
)

export const getUserByID = createAsyncThunk(
  'getUserByID',
  (uuid: string, { rejectWithValue }) =>
    getUserByUUID(uuid, rejectWithValue).then((response) => {
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const updateAvatar = createAsyncThunk(
  'updateAvatar',
  async (user: { uuid: string; avatar: string }, { rejectWithValue }) => {
    const userResponse = await getUserByUUID(user.uuid, rejectWithValue)

    if (userResponse) {
      const updatedUser = await putUser(
        { ...userResponse, avatar: user.avatar },
        rejectWithValue,
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = updatedUser
      return userWithoutPassword
    } else {
      throw rejectWithValue('User not found')
    }
  },
)

export const userReducer = userSlice.reducer
export const { logoutUser } = userSlice.actions
