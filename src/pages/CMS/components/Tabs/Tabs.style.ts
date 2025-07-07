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
      background: none;
      border: none;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      color: #888;
      border-radius: 10px 10px 0 0;
      transition:
        color 0.2s,
        background 0.2s;
    }

    button.active {
      color: #222;
      background: #f7f7f7;
      border-bottom: 2px solid #222;
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

    th,
    td {
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    th {
      background: #f7f7f7;
      font-weight: 600;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`
