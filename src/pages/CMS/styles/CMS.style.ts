import { styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { media } from '@/styles/media.breakpoints'

export const StyledCMS = styled.section`
  --page-loading-height: 0px;

  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  min-width: var(--min-width);
  max-width: var(--max-width);
  margin: 0 auto;

  ${media.down('sm')`
    min-width: 100%;
    max-width: 100%;
  `}
`

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.5rem;
  border-radius: 20px;
  background: var(--color-surface-container-low);
  box-shadow: var(--shadow);

  ${media.down('sm')`
    padding: 0.75rem;
  `}
`

export const MenuButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1.5rem;

  > ${StyledButton} {
    width: auto;
    padding-inline: 0.75rem;
  }
`

export const StyledTabs = styled.div`
  display: flex;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-outline-variant);

  a {
    flex: 1;
    padding: 0.5rem;
    background-color: var(--color-surface-container-lowest);
    font-weight: 600;
    text-align: center;
    color: var(--color-on-surface-variant);
    border-radius: 10px 10px 0 0;
    transition:
      color 0.2s ease-out,
      background-color 0.2s ease-out;
  }

  a.active {
    color: var(--color-on-tertiary);
    background-color: var(--color-tertiary);
    border-bottom: 2px solid var(--color-tertiary);
  }

  a:not(.active):hover {
    color: var(--color-on-surface);
    background-color: var(--color-surface-container-high);
  }
`

export const TableActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`

export const StyledTable = styled.div`
  max-width: var(--max-width);
  background: var(--color-surface-container);
  box-shadow: var(--shadow);

  table {
    width: 100%;
    border-collapse: collapse;

    tr {
      height: 3rem;
    }

    tbody tr {
      cursor: pointer;
      transition: background-color 0.2s ease-out;
    }

    tbody tr.selected {
      background-color: var(--color-secondary-container);
      color: var(--color-on-secondary-container);
    }

    tbody tr:not(.selected):hover {
      background: var(--color-surface-container-low);
    }

    th,
    td {
      padding: 0.25rem 0.75rem;
      border-bottom: 1px solid var(--color-outline-variant);
    }

    th:first-child,
    td:first-child {
      text-align: center;
    }

    th.actions,
    td.actions {
      width: 5rem;
      min-width: 5rem;
      padding: 0;
      text-align: center;
      white-space: nowrap;
    }

    th {
      background: var(--color-surface-container-high);
      font-size: 0.75rem;
      font-weight: 600;
      text-align: left;
    }

    td {
      font-size: 0.875rem;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`
