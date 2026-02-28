import { createAsyncThunk } from '@reduxjs/toolkit'
import { getUserOrders } from '@/api'
import type { Order } from '@/types'

export const fetchUserOrders = createAsyncThunk<Order[], void>(
  'orders/fetchUserOrders',
  () => getUserOrders(),
)
