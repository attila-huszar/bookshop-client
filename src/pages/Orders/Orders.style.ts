import { styled } from 'styled-components'
import { media } from '@/styles'

export const StyledOrders = styled.main`
  padding: 0 6.25rem 4rem;

  > h2 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ${media.down('sm')`
    padding: 0.5rem 2rem;

    > h2 {
      margin-bottom: 1.25rem;
      font-size: 1.25rem;
    }
  `}
`

export const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const OrderCard = styled.article`
  border: 1px solid var(--light-grey);
  border-radius: 10px;
  background-color: var(--pearly-white);
  padding: 1rem 1.25rem;
`

export const OrderHeader = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;

  > h4 {
    margin: 0;
  }

  > p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--dark-grey);
  }

  ${media.down('sm')`
    flex-direction: column;
    gap: 0.5rem;
  `}
`

export const OrderMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
  margin-bottom: 0.75rem;

  > p {
    margin: 0;
    overflow-wrap: anywhere;
  }

  > p > span {
    font-weight: 600;
  }

  ${media.down('sm')`
    grid-template-columns: 1fr;
  `}
`

export const OrderItems = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--light-grey);
`

export const OrderItem = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--light-grey);

  &:last-child {
    border-bottom: none;
  }

  > p {
    margin: 0;
  }

  > p:last-child {
    text-align: right;
    white-space: nowrap;
  }
`

export const OrderItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`

export const OrderItemImage = styled.img`
  width: 2.75rem;
  height: 3.75rem;
  border-radius: 0.375rem;
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--light-grey);
`

export const OrderItemTitle = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  overflow-wrap: anywhere;
`

export const OrderItemQuantityTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--light-grey);
  background-color: var(--primary-light);
  color: var(--light-black);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
`
