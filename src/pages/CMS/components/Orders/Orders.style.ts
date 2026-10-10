import { styled } from 'styled-components'
import { StyledTable } from '../../styles/CMS.style'

export const OrdersTable = styled(StyledTable)`
  overflow-x: auto;

  table tbody tr.email-history {
    cursor: default;

    &:not(.selected):hover {
      background: var(--color-surface-container);
    }
  }

  table td.email-history-cell {
    padding: 1rem;
    text-align: left;
  }
`
