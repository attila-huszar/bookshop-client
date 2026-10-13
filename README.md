# [Bookshop](https://book-shop.pages.dev/)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-764ABC?logo=redux)](https://redux.js.org/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=fff)](https://stripe.com/)
[![styled-components](https://img.shields.io/badge/styled-components-DB7093?logo=styledcomponents&logoColor=fff)](https://styled-components.com/)
[![Formik](https://img.shields.io/badge/Formik-2563EB?logo=formik&logoColor=fff)](https://formik.org/)
[![Vite](https://img.shields.io/badge/Vite-9135FF?logo=vite&logoColor=fff)](https://vite.dev/)

[![CI](https://github.com/attila-huszar/bookshop-client/actions/workflows/node.js.yml/badge.svg)](https://github.com/attila-huszar/bookshop-client/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/attila-huszar/bookshop-client/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/attila-huszar/bookshop-client/actions/workflows/github-code-scanning/codeql)

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/1vrpa.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

🛠️ [Service Status](https://bookshop.betteruptime.com/)

👉 [Bookshop Server](https://github.com/attila-huszar/bookshop-server)

A React and TypeScript bookshop demo with a storefront, custom Stripe checkout, and an admin CMS.

## Main capabilities

- Browse books, authors, recommendations, new releases, and news.
- Search and filter the catalogue, and save a basket between visits.
- Register, verify an account, reset a password, edit a profile, and view order history.
- Check out as a guest or account holder using Stripe's Payment Element.
- Manage books, authors, users, and orders in the admin CMS, including order email history.

## Setup

Install Node.js 22.12+, Bun, and Docker. Keep `bookshop-client` and `bookshop-server` as sibling directories.

From the client directory:

```sh
npm ci
cp .env.template .env
```

Configure the client `.env`:

- `VITE_BASE_URL`: frontend origin, normally `http://localhost:5173`.
- `VITE_SERVER_URL`: backend API, normally `http://localhost:5000/api`.
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable test key from the same account as the backend.
- `VITE_GOOGLE_MAPS_KEY`: optional address autocomplete; leave blank to skip it.

Vite environment values are public. Keep Stripe secret keys in the backend.

Complete the [backend setup](https://github.com/attila-huszar/bookshop-server#setup), including server dependencies, credentials, the database choice, Docker's Loki plugin, and Stripe test webhook forwarding. The backend supports SQLite/Drizzle or MongoDB/Mongoose; select one with its `COMPOSE_PROFILES` setting.

## Local development

For the first startup with a fresh database:

```sh
npm run dev:setup
```

For later starts, run `npm run dev`. Both commands launch local Vite and the backend Docker services. Setup seeds the catalogue and an admin account using the server's `ADMIN_EMAIL`/`ADMIN_PASSWORD`; run it only for a fresh database. Ctrl+C stops the session and preserves stored data.

Open the shop at http://localhost:5173. Keep the client URLs and the backend's `CLIENT_BASE_URL` aligned if you change ports.

Use `npm run dev:client` for Vite with an already running backend. To build and preview the frontend, run `npm run build`, then `npm run preview`.

See [Architecture and checkout flow](https://github.com/attila-huszar/bookshop-server/blob/HEAD/docs/architecture.md) for implementation details.

[![Bookshop](https://s3.eu-central-1.amazonaws.com/attila.huszar/portfolio/bookshop.webp)](https://book-shop.pages.dev/)
