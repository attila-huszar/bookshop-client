import { styled } from 'styled-components'
import { StyledTable } from '../../styles/CMS.style'

export const OutboxContainer = styled.section`
  padding-top: 1rem;

  > p {
    margin: 0.5rem 0 1rem;
    color: var(--color-on-surface-variant);
    font-size: 0.875rem;
  }
`

export const OutboxControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.875rem;
  }

  input,
  select {
    padding: 0.5rem;
    border: 1px solid var(--color-outline);
    border-radius: 5px;
    background: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font: inherit;
    max-width: 100%;
  }
`

export const RecipientSearch = styled.span`
  position: relative;
  display: flex;

  input {
    width: 100%;
    padding-right: 2.75rem;

    &::-webkit-search-cancel-button {
      display: none;
    }
  }
`

export const OutboxTable = styled(StyledTable)`
  overflow-x: auto;

  table {
    min-width: 1000px;

    tbody tr {
      cursor: default;
    }

    th:first-child,
    td:first-child {
      text-align: left;
    }

    td {
      padding: 0.75rem;
      vertical-align: top;
      overflow-wrap: anywhere;
      max-width: 220px;
    }

    small {
      display: block;
      margin-top: 0.25rem;
      color: var(--color-on-surface-variant);
    }
  }
`

export const StatusBadge = styled.span`
  display: inline-block;
  white-space: nowrap;
  overflow-wrap: normal;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  background: var(--color-secondary-container);
  color: var(--color-on-secondary-container);

  &[data-status='sent'] {
    background: var(--color-tertiary-container);
    color: var(--color-on-tertiary-container);
  }

  &[data-status='failed'] {
    background: var(--color-error-container);
    color: var(--color-on-error-container);
  }
`

export const OutboxPagination = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`
