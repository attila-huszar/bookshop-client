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
