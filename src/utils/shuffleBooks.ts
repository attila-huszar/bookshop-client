import { IBook } from '../interfaces'

export function shuffleBooks(booksArray: IBook[]): IBook[] {
  for (let i = booksArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = booksArray[i]
    booksArray[i] = booksArray[j]
    booksArray[j] = temp
  }

  return booksArray
}

export function getRandomBooks(booksArray: IBook[], count: number) {
  const bookCopy: IBook[] = [...booksArray]
  const randomBooks: IBook[] = []

  for (let i = 0; i < count; i++) {
    const randomIdx = Math.floor(Math.random() * bookCopy.length)
    const [removedBook] = bookCopy.splice(randomIdx, 1)
    randomBooks.push(removedBook)
  }

  return randomBooks
}
