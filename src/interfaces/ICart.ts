export interface ICart {
  id: number
  quantity: number
  title: string
  price: number
  discount: number
  imgUrl: string
}

export interface ILocalCart {
  id: number
  quantity: number
}
