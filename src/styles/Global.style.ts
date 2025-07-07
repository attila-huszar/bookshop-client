import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
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

  #root {
    margin: 0 1.5rem 1.5rem;
    --min-width: 54rem;
    --max-width: 90rem;
    --primary-color: #ffce1a;
    --primary-faded: #f0d153;
    --secondary-color: #ecb346;
    --white: #fdfdfd;
    --whitesmoke: #f7f7f7;
    --light-grey: #eaeaea;
    --mid-grey: #a7a7a7;
    --grey: #888888;
    --light-black: #555555;
    --black: #0F0F0F;
    --orange: #ff4500;
    --shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  }

  body {
    background-color: #ecb346;
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

export const sliderStyles = {
  track: {
    backgroundColor: 'var(--secondary-color)',
  },
  handle: {
    opacity: 1,
    border: 'none',
    backgroundColor: 'var(--secondary-color)',
  },
  rail: { backgroundColor: 'var(--grey)' },
}
