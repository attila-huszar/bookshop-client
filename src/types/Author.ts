export type Author = {
  id: number
  name: string
  fullName: string
  birthYear: string
  deathYear: string
  homeland: string
  biography: string
}

export type AuthorUpdate = { id: number } & Partial<Omit<Author, 'id'>>
