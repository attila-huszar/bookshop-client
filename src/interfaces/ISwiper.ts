import { IBook } from './IBook'
import { INewsCardProps } from './INewsCardProps'

export interface ISwiper {
  children: React.ReactElement<IBook>[] | React.ReactElement<INewsCardProps>[]
}
