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
    --secondary-color: #ecb346;
    --white: #fdfdfd;
    --whitesmoke: #f3f3f3;
    --light-grey: #eaeaea;
    --grey: #6c6c6c;
    --black: #0d0842;
    --orange: #ff5841;
  }

  body {
    background-color: #ecb346;
  }

  a { 
    text-decoration: none;
    color: var(--black);
  }
`
