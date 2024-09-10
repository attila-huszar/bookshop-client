import { IBook } from '@/interfaces'

export function getRandomBooks(booksArray: IBook[], count: number) {
  const bookCopy: IBook[] = [...booksArray]
  const randomBooks: IBook[] = []

  for (let i = 0; i < count; i++) {
    if (bookCopy.length) {
      const randomIdx = Math.floor(Math.random() * bookCopy.length)
      const [removedBook] = bookCopy.splice(randomIdx, 1)
      randomBooks.push(removedBook)
    }
  }
  return randomBooks
}
