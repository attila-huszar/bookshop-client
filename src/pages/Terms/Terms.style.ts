import { styled } from 'styled-components'

export const Article = styled.article`
  padding: 2rem;
  margin: 2rem 0;
  background: var(--color-surface-container-lowest);
  border-radius: var(--border-radius);

  h1,
  p {
    margin-bottom: 1rem;
    overflow-wrap: anywhere;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  pre {
    font: inherit;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  @media print {
    padding: 0;
    margin: 0;
    color: black;
    background: white;
    .actions {
      display: none;
    }
  }
`
