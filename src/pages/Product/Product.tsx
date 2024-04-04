import { Link, useParams } from 'react-router-dom'
import { StyledProduct, Breadcrumb } from './Product.styles'

export function Product() {
  const { id } = useParams()

  return (
    <StyledProduct>
      <Link to="..">
        <Breadcrumb>Book Details</Breadcrumb>
      </Link>
      <div>Product: {id}</div>
    </StyledProduct>
  )
}
