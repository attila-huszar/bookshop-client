import { booksApi } from '@/store/api/booksApi'
import type { AppDispatch, RootState } from '@/store/store'

/** Refresh canonical book queries; prices never replace basket intent. */
export const refreshCartPrices =
  () =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    await Promise.allSettled(
      getState().cart.cartItems.map(async (item) => {
        const running = dispatch(
          booksApi.util.getRunningQueryThunk('book', item.id),
        )

        if (running) {
          await running
        }

        await dispatch(
          booksApi.endpoints.book.initiate(item.id, {
            subscribe: false,
            forceRefetch: true,
          }),
        ).unwrap()
      }),
    )
  }
