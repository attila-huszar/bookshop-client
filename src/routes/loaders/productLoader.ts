import { fetchBookById, store } from '@/store'

export const productLoader = async (request: Request) => {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))

  if (!id || isNaN(id)) return

  const book = store.getState().books.books.find((b) => b.id === id)

  if (book) return

  await store.dispatch(fetchBookById(id))
}
