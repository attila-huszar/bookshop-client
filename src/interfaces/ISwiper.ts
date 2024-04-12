import { IBook } from './IBook'
import { INews } from './INews'

export interface ISwiper {
  children: React.ReactElement<IBook>[] | React.ReactElement<INews>[]
}
