import { createGlobalStyle } from 'styled-components'
import { media } from './media.breakpoints'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :root {
    --min-width: 54rem;
    --max-width: 90rem;
    --color-page-frame: #5a6547;
    --color-surface-container-lowest: #ffffff;
    --color-surface: #fdf9f0;
    --color-surface-bright: #fdf9f0;
    --color-surface-container-low: #f7f3ea;
    --color-surface-container: #f1ede3;
    --color-surface-container-high: #e7e3d9;
    --color-surface-container-highest: #ddd9ce;
    --color-surface-dim: #dddad1;

    --color-on-surface: #211a14;
    --color-on-surface-variant: #544b42;
    --color-outline: #857b70;
    --color-outline-variant: #d5cdbe;

    --color-primary: #8c4a27;
    --color-on-primary: #ffffff;
    --color-primary-container: #ffdcc1;
    --color-on-primary-container: #351000;
    --color-primary-hover: color-mix(in srgb, var(--color-primary), black 12%);

    --color-secondary: #7c5800;
    --color-on-secondary: #ffffff;
    --color-secondary-container: #ffdf9f;
    --color-on-secondary-container: #271900;
    --color-secondary-hover: color-mix(in srgb, var(--color-secondary), black 12%);

    --color-tertiary: #4f6452;
    --color-on-tertiary: #ffffff;
    --color-tertiary-container: #d2e9d3;
    --color-on-tertiary-container: #0c2012;

    --color-error: #a31616;
    --color-on-error: #ffffff;
    --color-error-container: #ffdad2;
    --color-on-error-container: #410002;
    --color-error-hover: color-mix(in srgb, var(--color-error), black 12%);

    --color-shadow: #161914;
    --color-shadow-light: color-mix(in srgb, var(--color-shadow) 12%, transparent);
    --color-shadow-medium: color-mix(in srgb, var(--color-shadow) 20%, transparent);
    --color-shadow-strong: color-mix(in srgb, var(--color-shadow) 35%, transparent);
    --color-backdrop: color-mix(in srgb, var(--color-shadow) 45%, transparent);
    --color-avatar-overlay: color-mix(in srgb, var(--color-surface-bright) 46%, transparent);
    --color-mask-opaque: #000000;

    --border-radius: 6px;
    --corner-cut: 1.25rem;
    --shadow: 0 10px 18px -6px var(--color-shadow-medium), 0 3px 6px -2px var(--color-shadow-light);
    --shadow-page: 0 8px 18px -6px var(--color-shadow-medium), 0 2px 6px -2px var(--color-shadow-light);
    --shadow-popover: 0 4px 10px -3px var(--color-shadow-medium);
    --shadow-raised: 0 8px 20px -4px var(--color-shadow-strong);
    --shadow-book: 0 5px 10px var(--color-shadow-medium), 0 2px 4px var(--color-shadow-light);
    --shadow-button: 0 3px 6px -2px var(--color-shadow-medium), 0 1px 2px var(--color-shadow-light);
    --shadow-button-hover: 0 5px 10px -3px var(--color-shadow-medium), 0 2px 3px var(--color-shadow-light);
    --shadow-button-pressed: inset 0 2px 4px var(--color-shadow-medium);
  }

  #root {
    margin: 0 1.5rem 1.5rem;

    ${media.down('sm')`
      margin: 0 1rem 1rem;
    `}
  }

  body {
    background-color: var(--color-page-frame);
    color: var(--color-on-surface);
  }

  a { 
    text-decoration: none;
    color: var(--color-on-surface);
  }

  button:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 3px;
  }

  button:disabled {
    cursor: not-allowed;
  }

  dialog::backdrop {
    background-color: var(--color-backdrop);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number]{
    -moz-appearance: textfield;
  }
`
