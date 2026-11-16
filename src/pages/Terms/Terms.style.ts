import { styled } from 'styled-components'
import { StyledButton } from '@/components/Button/Button.style'
import { media } from '@/styles/media.breakpoints'

export const DownloadButton = styled(StyledButton)`
  max-width: 100%;
  margin-top: 1.5rem;
`

export const PublishedDate = styled.p`
  font-style: italic;
`

export const Article = styled.article`
  padding: 2rem 6.25rem;
  margin: 2rem 0;
  background: var(--color-surface-container-lowest);
  border-radius: var(--border-radius);

  h1,
  p {
    margin-bottom: 1rem;
    overflow-wrap: anywhere;
  }
  pre {
    font: inherit;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  ${media.down('sm')`
    padding-inline: 2rem;
  `}

  @media print {
    padding: 0;
    margin: 0;
    color: black;
    background: white;
    ${DownloadButton} {
      display: none;
    }
  }
`
