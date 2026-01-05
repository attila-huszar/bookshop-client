import type { Book } from '@/types'

export function getRandomBooks(booksArray: Book[], count: number) {
  const bookCopy: Book[] = [...booksArray]
  const randomBooks: Book[] = []

  for (let i = 0; i < count; i++) {
    if (bookCopy.length) {
      const randomIdx = Math.floor(Math.random() * bookCopy.length)
      const [removedBook] = bookCopy.splice(randomIdx, 1)
      if (removedBook) randomBooks.push(removedBook)
    }
  }
  return randomBooks
}
