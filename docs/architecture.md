# Frontend architecture

The React/TypeScript client owns the storefront and CMS interface, browser state, and checkout workflow. The [backend](../../bookshop-server/docs/architecture.md) owns authentication rules, prices, order persistence, payment updates, and email delivery. Setup commands are in the [README](../README.md).

## State ownership

RTK Query is the single cache for catalogue data, profiles, orders, CMS entities, and payment HTTP requests. Domain APIs in `src/store/api` share one reducer, middleware, and invalidation tags. Pages own subscriptions and loading/error presentation; query responses remain immutable.

Redux slices hold cart IDs and quantities, session state, checkout workflow, and filter/pagination UI. Server data does not replace cart intent. Equivalent filters share cache entries, and catalogue pages use data for the current query arguments.

Ky owns token attachment, cookies, and single-flight refresh. Guest payment requests include payment cookies. Authentication transitions clear private query data. API caches, payment tokens, and full PaymentIntent responses are never persisted; browser storage holds cart intent, language preference, and the safe payment ID used for recovery.

## Sessions and routing

The root loader restores the cookie session and validates saved cart intent before pages mount. Protected routes wait for the current profile and role before mounting private pages, and respond to expiry or role changes. Transient authorization failures remain retryable.

Concurrent 401 responses share one refresh, with at most one authentication retry per request. Responses from an older session cannot refresh or expire a newer login. Logout completes its local transition after the server clears cookies; failure remains retryable.

Cart reads subscribe to canonical book queries. Price-conflict recovery waits for older in-flight reads and forces fresh requests while preserving quantities.

## Checkout and payment recovery

Checkout supports guests and account holders through Stripe's Payment Element and PaymentIntents. The server recalculates prices and persists the order snapshot. The return page displays Stripe status; backend webhooks and reconciliation own paid-state changes. See [backend checkout guarantees](../../bookshop-server/docs/architecture.md#custom-checkout).

`src/services/checkout.ts` coordinates payment creation, restoration, cancellation, and stored payment identity. The payment slice holds a validated, minimal in-memory session and operation identity. Asynchronous results must match the current operation and payment ID, so resetting checkout invalidates older completions.

Stripe return identifiers take precedence over stored checkout state, and identifiers/secrets are stripped from the URL before further requests. Aborted restoration retains the safe payment ID; unavailable sessions clear it; transient failures remain retryable. Status polling is bounded and stops when its operation ends.

Identical creation retries reuse an idempotency key. A changed cart or explicit fresh attempt receives a new key. A price conflict refreshes prices and requires another submission. Client totals follow the server's USD policy: round the unit price and discounted unit price to cents, multiply by quantity, and sum integer cents.

## Terms and CMS

Terms are immutable bilingual documents served by the backend, separate from interface translations. Public routes expose current and archived versions. Checkout loads the persisted order summary and current terms, then records explicit acceptance of that version and language before Stripe confirmation. Missing terms, failed acceptance, or a changed version blocks submission; changed terms require a refreshed review and acceptance.

CMS publication creates a revision when content changes. The server's `canDelete` flag identifies unused versions; deleting the last publication makes checkout unavailable. See [backend terms guarantees](../../bookshop-server/docs/architecture.md#terms-publication-and-acceptance).

CMS order creation is disabled. Only customer/shipping corrections are editable; payment state, totals, currency, and item snapshots are read-only. Orders and users support reversible soft deletion; catalogue deletion is permanent. Order email history is fetched on demand for the exact payment ID and exposes summaries without bodies, account links, or resend/delete actions.

## Localization and API contracts

English and Hungarian interface resources load through i18next, with English fallback. An explicit language preference takes precedence over browser detection. Document language, dates, amounts, and Stripe Elements locale follow the active language; terms content comes from the backend.

API codes, roles, statuses, and filter values retain their wire representations. Client types describe public responses and commands. Errors are translated at display time from stable codes and sanitized validation metadata, so changing language does not require refetching failures. See [backend response contracts](../../bookshop-server/docs/architecture.md#api-response-and-error-contracts).

Expected 4xx responses and intentional cancellations remain quiet. Final server/network failures are reported after retries, without query strings, cookies, or authorization headers. Log uploads bypass reporting to prevent recursion.

## Runtime and development

The Node.js version is pinned in `.node-version`; Vite produces static browser assets. Development runs local Vite alongside the backend Docker stack. Database setup and container lifecycle belong to the [backend runtime](../../bookshop-server/docs/architecture.md#runtime-and-development).
