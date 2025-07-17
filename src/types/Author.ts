export type Author = {
  id: number
  name: string
  fullName: string
  birthYear: string
  deathYear: string
  homeland: string
  biography: string
}

export type AuthorFormValues = Omit<Author, 'id'>
