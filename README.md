# Book Shop

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-grey?logo=react)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-764ABC?logo=redux)](https://redux.js.org/)  
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=fff)](https://stripe.com/)
[![Formik](https://img.shields.io/badge/Formik-2563EB?logo=formik&logoColor=fff)](https://formik.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=fff)](https://cloudinary.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev/)

## Stripe payment intent

Deploy as serverless function  
Set <STRIPE_SECRET> environment variable for the cloud function  
Set <VITE_STRIPE_PUBLIC_KEY> and <VITE_STRIPE_CLOUD_FUNCTION_URL> in .env file

```js
const express = require("express");
const serverless = require("serverless-http");
const stripeSecret = process.env.STRIPE_SECRET;
const stripe = require("stripe")(stripeSecret);

const app = express();
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, receipt_email, description, shipping } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    receipt_email,
    description,
    shipping,
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports.handler = serverless(app);

```
