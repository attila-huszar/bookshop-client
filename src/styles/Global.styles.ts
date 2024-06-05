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
    --primary-color: #ffce1a;
    --primary-faded: #ffde67;
    --secondary-color: #ecb346;
    --white: #fdfdfd;
    --whitesmoke: #f7f7f7;
    --light-grey: #eaeaea;
    --grey: #888888;
    --light-black: #555555;
    --black: #0F0F0F;
    --orange: #ff4500;
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
