export type News = {
  id: number
  title: string
  content: string
  img: string
}

export type NewsUpdate = { id: number } & Partial<Omit<News, 'id'>>
