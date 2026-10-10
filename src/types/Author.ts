export type Author = {
  id: number
  name: string
  fullName: string
  birthYear: string
  deathYear: string
  homeland: string
  biography: string
  createdAt?: string
  updatedAt?: string
}

export type AuthorCreate = Omit<Author, 'id' | 'createdAt' | 'updatedAt'>

export type AuthorUpdate = { id: number } & Partial<AuthorCreate>

export type AuthorReference = Pick<Author, 'id' | 'name'>
