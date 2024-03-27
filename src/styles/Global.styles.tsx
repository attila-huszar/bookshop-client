import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
   }
   
  #root {
    --bgColor: #fff;
    --bgMobileColor: #f3f3f3;
    --generalColor: #ffce1a;
    --textColor: #0d0842;
    --textLightColor: #fffff8;
    --textGreyColor: #6c6c6c;
    --favoriteColor: #ff5841;
   }
`
