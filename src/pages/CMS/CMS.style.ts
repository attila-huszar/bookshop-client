import { styled } from 'styled-components'

export const StyledCMS = styled.section`
  min-width: var(--min-width);
  max-width: var(--max-width);
  margin: 0 auto;
`

export const MainContainer = styled.div`
  padding: 1.5rem;
  border-radius: 20px;
  background: var(--white);
  box-shadow: var(--shadow);
`

export const MenuButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

export const StyledTable = styled.div`
  max-width: var(--max-width);
  background: var(--white);
  box-shadow: var(--shadow);

  table {
    width: 100%;
    border-collapse: collapse;

    thead tr {
      height: 2.875rem;
    }

    tbody tr {
      cursor: pointer;
      transition: background-color 0.2s ease-out;
    }

    tbody tr.selected {
      background-color: var(--secondary-faded);
    }

    tbody tr:not(.selected):hover {
      background: var(--secondary-hover);
    }

    th,
    td {
      padding: 0.25rem 0.75rem;
      border-bottom: 1px solid #eee;
    }

    th {
      background: var(--whitesmoke);
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
