import { styled } from 'styled-components'

export const StyledTabs = styled.div`
  max-width: var(--max-width);
  margin: 4rem auto;

  .tab-list {
    max-width: var(--max-width);
    display: flex;
    border-bottom: 1px solid #eee;

    button {
      flex: 1;
      padding: 1rem 0;
      background-color: var(--white);
      border: none;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--dark-grey);
      border-radius: 10px 10px 0 0;
      transition:
        color 0.2s ease-out,
        background-color 0.2s ease-out;
    }

    button.active {
      color: var(--black);
      background-color: var(--secondary-color);
      border-bottom: 2px solid var(--secondary-dark);
    }

    button:not(.active):hover {
      color: var(--black);
      background: var(--secondary-hover);
    }
  }
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
    }

    td {
      font-size: 0.875rem;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`
