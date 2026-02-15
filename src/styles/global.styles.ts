import { createGlobalStyle } from 'styled-components'

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
    --primary-color: #ecb346;
    --primary-light: #e0c696;
    --primary-faded: #c6902b;
    --secondary-color: #d7ecfe;
    --secondary-dark: #63a5de;
    --secondary-hover: #f0f8ff;
    --secondary-faded: #daedfd;
    --white: #fdfdfd;
    --white-smoke: #f5f5f5;
    --pearly-white: #f8f6f2;
    --hover-grey: #f9f9f9;
    --light-grey: #eaeaea;
    --mid-grey: #a7a7a7;
    --grey: #888888;
    --dark-grey: #666666;
    --light-black: #555555;
    --black: #0F0F0F;
    --orange: #ff4500;

    --border-radius: 6px;
    --shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  }

  #root {
    margin: 0 1.5rem 1.5rem;
  }

  body {
    background-color: var(--primary-color);
  }

  a { 
    text-decoration: none;
    color: var(--black);
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
