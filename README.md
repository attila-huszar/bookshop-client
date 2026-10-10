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

## About this demo

A React/TypeScript bookshop with catalogue search/filtering, a basket, account flows, a custom Stripe Payment Element checkout, and an admin CMS. The companion backend deliberately supports SQLite/Drizzle and MongoDB/Mongoose for comparison. Stripe PaymentIntents are retained as a learning exercise rather than replaced by hosted Checkout.

## Setup and commands

Install dependencies with `npm ci`, copy `.env.template` to `.env`, and configure the matching backend and Stripe **test publishable** key. Never put Stripe secret keys in a Vite environment variable: client environment values are public.

Keep this repo beside `bookshop-server`. Install its dependencies with `bun install --frozen-lockfile`, configure its `.env`, and start Docker Desktop/the Docker daemon. Shared development requires Bun and Node.js 22.12+.

- `VITE_BASE_URL`: this application's origin (default `http://localhost:5173`).
- `VITE_SERVER_URL`: backend API URL (default `http://localhost:5000/api`).
- `VITE_STRIPE_PUBLIC_KEY`: Stripe test publishable key.
- `VITE_GOOGLE_MAPS_KEY`: optional address-autocomplete configuration.

```sh
npm run dev
# First boot of a fresh demo database: npm run dev:setup
# Bun equivalents: bun dev / bun dev:setup
npm run typecheck
npm run lint
npm run format:check
npm run test:ci
npm run build
```

Tests use Vitest's `vmThreads` pool with jsdom: workers reuse environment initialization while each test file gets a fresh window and isolated module context. To compare with the process-based pool, run `npm run test:ci -- --pool=forks`.

`dev` delegates to the backend's package script, which runs local Vite and the Docker backend together. It works from either repository, using one Compose file and no custom launcher. The backend API/worker reload on source changes; Redis, cron, and the selected database run in Docker. Select SQLite or Mongo through the server `.env`'s `COMPOSE_PROFILES`.

The development Vite proxy sends `/api` requests to `VITE_SERVER_URL`. Keep client/API URLs and the backend's `CLIENT_BASE_URL` aligned when changing ports. Production uses the configured API URL directly.

Ctrl+C stops the session without removing Docker volumes. `dev:setup` explicitly initializes a fresh database; normal startup does not reseed. Dev and normal backend Docker startup share the configured project's volumes, and the existing Loki Docker plugin requirement still applies. Use `npm run dev:client` for Vite alone. See the [backend setup guide](https://github.com/attila-huszar/bookshop-server#local-development) for credentials, initialization, and Docker-only commands.

## State ownership

RTK Query in `src/store/api/bookshopApi.ts` is the single server-data cache for books, author references, news, country names, user profiles, account orders, and CMS lists/mutations. Mounted query hooks retain subscriptions and loaders warm the same cache directly. Forms use mutation hooks, including registration, profile updates, and avatar uploads. CMS writes invalidate public and admin views together.

Exported hooks for endpoints without arguments accept only an optional options object, such as `useSearchOptionsQuery({ refetchOnMountOrArgChange: cacheTimes.reference })` or `useUserProfileQuery({ skip: !accessToken })`. These typed wrappers call the generated RTK Query hooks with `undefined` internally and preserve result inference, including `selectFromResult`. Hooks for parameterized queries retain the standard `(argument, options)` signature. Loaders and cache utilities use the generated endpoint methods directly.

Cache durations are defined in `src/store/api/cacheTimes.ts`. Retention starts after the last subscriber unmounts; data stays cached while subscribed. Catalogue and home-page queries also check the last successful fetch on remount and refresh results older than their configured duration. Focus/reconnect refresh active queries except random recommendations and static country names, whose selection stays stable while browsing. Recommendations refresh on remount after 15 minutes or after a relevant CMS edit. Cache data is held in memory and cleared on session transitions and page reloads. Repeated guest session checks preserve public cached data.

| Query data                                       | Retention after last subscriber |
| ------------------------------------------------ | ------------------------------- |
| Catalogue pages, book details, books by author   | 5 minutes                       |
| Recommendations, new releases, top sellers, news | 15 minutes                      |
| Author references and filter options             | 1 hour                          |
| Country names                                    | 7 days                          |
| Typed searches, profile, orders, CMS lists       | 60 seconds                      |

Orders continue to refetch on mount. Cart price-conflict recovery forces a fresh book request, regardless of cache age.

The remaining Redux slices hold cart intent, authentication/session state, the custom payment workflow, and pagination/filter UI. `src/types/State.ts` describes these stored slice values; query results and derived presentation values are inferred from their selectors. Catalogue selectors depend on relevant query entries, so unrelated account or CMS queries do not trigger recalculation. Cart loading is derived from its active hydration request ID. Login/logout and payment cancellation errors are handled by their callers from thunk results. Thunks coordinate login/logout/token refresh, cart hydration/price recovery, and checkout workflows. Pagination and filter actions change UI state; the mounted books query fetches the matching page. Shop shows loading while the matching page is unavailable, keeps cached books visible during background refreshes, and shows the filter reset prompt only after an empty response.

Ky remains the HTTP layer and owns cookie handling and single-flight access-token refresh. A shared `kyBaseQuery` connects RTK Query endpoint request definitions to the public/authenticated Ky clients, forwards cancellation, and converts failures into serializable errors. Session and checkout workflows use Ky directly outside the server-data cache. Authentication callbacks are bound at store startup instead of the HTTP client importing the store. A 401 refreshes the token and retries once; a second 401 expires the matching authenticated session through its workflow thunk. Login/logout and lost refresh sessions clear query data, including private profile/order/CMS results. Stale responses and refresh results cannot overwrite or clear a newer login. A deleted account or recreated demo database invalidates the old session: the server returns 401 for its profile and refresh clears the stale cookie, so the mounted profile query stops. `persistenceMiddleware` saves minimal cart items and safe payment identifiers, and discards the stored checkout attempt when the basket changes or checkout resets.

Query results are immutable. Search copies results before merging author matches. Cart hydration uses the `book(id)` endpoint directly, letting RTK Query reuse its cache and deduplicate requests; list queries have separate cache entries and do not substitute for book details. Cart price recovery forces a fresh book query instead of accepting a cached price. Recommendations come from real sampled catalogue rows, so deleted numeric IDs do not cause random 404s.

Core pages show initial loading before displaying empty results and retain cached content during background refreshes. Product details use the current book's query result when the ID changes. Optional home shelves and news appear only when they have content, without loading messages; the welcome copy stays visible while release covers load. Filter options load quietly. Country fields retain their selected code until names arrive and show loading only inside an opened dropdown. Book forms stay visible while the author choice and Save button wait for reference data. Search and order-email refreshes indicate pending requests within their buttons instead of inserting loading text. Search aborts its requests when the text changes, is cleared, or the component unmounts, and ignores late responses. CMS confirmation actions and avatar removal show pending indicators and prevent repeated submissions.

## Custom checkout and guests

Checkout supports both guests and signed-in accounts. The client keeps an idempotency key for one active checkout attempt; the server derives a principal-and-request-bound checkout request ID. Identical retries use the same persisted order snapshot and PaymentIntent.

The payment token is held only in memory. Cart storage keeps minimal item IDs/quantities; checkout storage keeps safe attempt/payment identifiers, not the Stripe client secret or a full payment response. Stripe SDK wire properties keep their vendor names.

The return page displays Stripe status, but does not mark an order paid. Signed webhooks and maintenance reconciliation own that update. The backend saves confirmation email intents in the same transaction as the first-paid transition; a separate outbox relay/worker delivers them asynchronously.

Admins receive one **New order** email after the first successful payment, with no separate creation/confirmed notifications. A **Reconciliation failed** alert follows three consecutive failed checks of an order and includes the reason and Stripe Dashboard link. The backend keeps the failure count and active alert ID on the order; recovery clears them and makes queued alerts obsolete. Payments with no local order are logged for manual investigation and left to Stripe's webhook retry. The CMS Orders email history shows reconciliation reasons separately from mail publication/delivery failures.

A price conflict refreshes basket prices and requires the user to review/retry. A canceled checkout requires a fresh attempt. Guest payment reads/cancellation use the signed payment-session cookie and do not require account login.

See the [complete backend architecture and flow](https://github.com/attila-huszar/bookshop-server/blob/HEAD/docs/architecture.md) for identifiers, outbox delivery limits, database differences, and reconciliation.

## CMS boundaries and contracts

The theme uses semantic color tokens in `global.styles.ts`: warm cream and parchment surfaces, espresso text, terracotta primary actions, brass secondary actions, and sage success states. Filled buttons use their matching light foreground colors; tinted badges and active states use the corresponding container foregrounds. Destructive actions keep a separate muted red error palette. Shadows and overlays also use shared theme tokens: the page shadow fades in along the sides below the sticky top cover and stays soft at the bottom, while buttons use smaller neutral shadows rather than a brand-colored glow. Shared buttons keep their visual style on hover: filled buttons darken, outlined buttons receive a light background tint, and icon buttons receive a muted surface background. Cancel, Close, and Reset use the reusable Neutral variant. Disabled controls do not respond to hover; keyboard focus uses a visible ring. Filter buttons share the same styles instead of duplicating their own theme.

CMS order Add is disabled. Customer/shipping corrections are editable, but payment status, paid time, totals, currency, and items are read-only. The server enforces the same allowlist; there is no “mark paid” action.

CMS orders and users use **Remove** for soft deletion and a secondary **Restore** action. The store/store-slash icon on Orders and user/user-slash icon on Users switch between active and removed records; switching views clears the selection. Remove confirmations explain that records can be restored, while books and authors use **Delete** with an explicit irreversible-action warning. DELETE on the existing order/user endpoints sets `deletedAt`; PATCH to `/api/cms/restore/orders` or `/api/cms/restore/users` clears it. RTK Query keeps one server-owned list per entity and refreshes it after each command. Order soft deletion changes CMS visibility while customer history, checkout retries, webhooks, reconciliation, and email processing retain access. Deleted users lose authenticated account access and keep their reserved email address and order history; restore them before editing. Logout sends a cookie-only request so expired or deleted sessions can still clear their cookies without refreshing.

Types describe API data and mutation commands rather than arbitrary database records. Public books carry an author name/reference; CMS book mutations carry an author ID. User metadata shown in the CMS excludes password hashes and verification/reset tokens.

All CMS tables have a centered **Actions** column with Edit first. On **Orders**, the envelope icon beside Edit expands the order's read-only notification history inline when it has a payment ID. The server matches the exact payment ID for customer confirmations and admin new-order/reconciliation-failure notifications. History loads when expanded; filter by type/status, search recipients, browse pages, or refresh the results. Account emails are outside this view, and there is no separate outbox tab. RTK Query owns these summaries and clears them with the other private data on session changes. Email bodies and shipping snapshots stay private. Sent means SMTP accepted the message, not inbox delivery; older Processed entries have no delivery history. Queue publication and worker delivery attempts are counted separately, and next-attempt times are estimates. Emails cannot be resent or deleted from the CMS.

This is a demo, not production fulfillment/accounting: refunds, disputes, inventory reservations, broader audit/retention policies, and managed infrastructure are separate features. Agent-specific working rules live in [AGENTS.md](AGENTS.md); this README is for developers and readers.

[![Bookshop](https://s3.eu-central-1.amazonaws.com/attila.huszar/portfolio/bookshop.webp)](https://book-shop.pages.dev/)
