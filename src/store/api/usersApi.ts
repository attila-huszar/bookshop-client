import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/cacheTimes'
import type {
  CmsUser,
  CmsUserCreate,
  CmsUserUpdate,
  CountryData,
  RegisterRequest,
  RegisterResponse,
  User,
  UserProfileUpdate,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export const usersApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    countryCodes: build.query<CountryData, void>({
      query: () => ({ url: PATH.users.countryCodes }),
      keepUnusedDataFor: CacheTime.OneWeek,
    }),

    userProfile: build.query<User, void>({
      query: () => ({ url: PATH.users.profile, withAuth: true }),
      providesTags: ['Profile'],
    }),

    cmsUsers: build.query<CmsUser[], void>({
      query: () => ({ url: PATH.cms.users, withAuth: true }),
      providesTags: ['User'],
    }),

    register: build.mutation<RegisterResponse, RegisterRequest>({
      query: (user) => {
        const body = new FormData()
        body.append('firstName', user.firstName)
        body.append('lastName', user.lastName)
        body.append('email', user.email)
        body.append('password', user.password)
        body.append('country', user.country)

        if (user.avatar instanceof File) {
          body.append('avatar', user.avatar)
        }

        return { url: PATH.users.register, method: 'post', body }
      },
    }),

    updateUserProfile: build.mutation<User, UserProfileUpdate>({
      query: (json) => ({
        url: PATH.users.profile,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    updateAvatar: build.mutation<User, FormData>({
      query: (body) => ({
        url: PATH.users.avatar,
        method: 'post',
        body,
        withAuth: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    addUser: build.mutation<CmsUser, CmsUserCreate>({
      query: (json) => ({
        url: PATH.cms.users,
        method: 'post',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    updateUser: build.mutation<CmsUser, CmsUserUpdate>({
      query: (json) => ({
        url: PATH.cms.users,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    softDeleteUsers: build.mutation<number, number[]>({
      query: (userIds) => ({
        url: PATH.cms.users,
        method: 'delete',
        json: { userIds },
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    restoreUsers: build.mutation<number, number[]>({
      query: (userIds) => ({
        url: PATH.cms.restore.users,
        method: 'patch',
        json: { userIds },
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
  }),
})

export const {
  useCountryCodesQuery,
  useUserProfileQuery,
  useRegisterMutation,
  useUpdateUserProfileMutation,
  useUpdateAvatarMutation,
  useCmsUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useSoftDeleteUsersMutation,
  useRestoreUsersMutation,
} = usersApi
