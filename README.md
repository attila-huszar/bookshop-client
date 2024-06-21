# Book Shop

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-grey?logo=react)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-764ABC?logo=redux)](https://redux.js.org/)  
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=fff)](https://stripe.com/)
[![Formik](https://img.shields.io/badge/Formik-2563EB?logo=formik&logoColor=fff)](https://formik.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=fff)](https://cloudinary.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev/)

## Stripe payment intent

Deployed as serverless function (AWS Lambda)

```const express = require("express");
const serverless = require("serverless-http");
const stripeSecret = process.env.STRIPE_SECRET;
const stripe = require("stripe")(stripeSecret);

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const calculateOrderAmount = items => {
  return items.reduce((a, b) => a + b, 0);
};

app.post("/create-payment-intent", async (req, res) => {
    const {
    items,
    currency = "usd",
    receipt_email,
    description,
    shipping,
  } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
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
