import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/cacheTimes'
import type {
  CmsOrder,
  CmsOrderUpdate,
  EmailOutboxQuery,
  EmailOutboxResponse,
  Order,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export const ordersApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    userOrders: build.query<Order[], void>({
      query: () => ({ url: PATH.orders, withAuth: true }),
      providesTags: ['Order'],
    }),

    cmsOrders: build.query<CmsOrder[], void>({
      query: () => ({ url: PATH.cms.orders, withAuth: true }),
      providesTags: ['Order'],
    }),

    cmsEmailOutbox: build.query<EmailOutboxResponse, EmailOutboxQuery>({
      query: (criteria) => ({
        url: PATH.cms.emailOutbox,
        searchParams: criteria,
        withAuth: true,
      }),
      keepUnusedDataFor: CacheTime.None,
    }),

    updateOrder: build.mutation<CmsOrder, CmsOrderUpdate>({
      query: (json) => ({
        url: PATH.cms.orders,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Order'],
    }),

    softDeleteOrders: build.mutation<number, number[]>({
      query: (orderIds) => ({
        url: PATH.cms.orders,
        method: 'delete',
        json: { orderIds },
        withAuth: true,
      }),
      invalidatesTags: ['Order'],
    }),

    restoreOrders: build.mutation<number, number[]>({
      query: (orderIds) => ({
        url: PATH.cms.restore.orders,
        method: 'patch',
        json: { orderIds },
        withAuth: true,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useUserOrdersQuery,
  useCmsOrdersQuery,
  useCmsEmailOutboxQuery,
  useUpdateOrderMutation,
  useSoftDeleteOrdersMutation,
  useRestoreOrdersMutation,
} = ordersApi
