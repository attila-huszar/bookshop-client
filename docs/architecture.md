# Frontend architecture

The React/TypeScript client owns the storefront, CMS interface, browser state, and checkout workflow. The [backend](../../bookshop-server/docs/architecture.md) owns authentication rules, pricing, orders, payment updates, and email delivery. Setup is in the [README](../README.md).

## State ownership

RTK Query is the single cache for catalogue data, profiles, orders, CMS entities, and payment requests. Domain APIs share one reducer, middleware, and invalidation tags; responses remain immutable.

Window focus refreshes active profile, order, and order email history queries. The public catalogue and news reuse their cache on focus, including prefetched book details.

Redux slices hold cart intent, session state, checkout workflow, and filter/pagination UI. Equivalent filters share cache entries, and pages use results for their current query arguments. Cart price recovery bypasses stale book data and waits for older reads before refreshing, preserving quantities.

Ky owns token attachment, cookies, and single-flight refresh, including guest payment cookies. Authentication transitions clear private query data. API caches, Google credentials, payment tokens, and full PaymentIntent responses are never persisted. Browser storage holds cart intent, language preference, and safe checkout identity/retry keys.

## Sessions and routing

The root loader validates saved cart intent and starts cookie session restoration in the background. Protected routes wait for restoration and the current profile and role. Checkout waits for the session before creating or restoring payment. Transient authorization failures remain retryable.

The app root loads Google Identity Services once through `@react-oauth/google`. A shared auth layout keeps one Google button and handler mounted while Login and Registration forms switch, coordinating all submissions. The Google component owns the browser challenge and invalidates callbacks when leaving auth. Opaque ID tokens go to the backend for verification and use the same session contract as password login. Account creation and linking rules belong to the [backend](../../bookshop-server/docs/architecture.md#authentication-and-account-lifecycle).

Concurrent 401 responses share one refresh and allow one authentication retry per request. Session revisions reject stale responses. Logout completes locally after the server clears cookies; failures remain retryable.

Login/logout notifications use BroadcastChannel without sharing tokens or account data. Other tabs clear private state and restore the cookie session before redirecting. Foreground checks cover missed notifications: account changes clear caches, unchanged accounts preserve mounted forms, and failed checks preserve the current session. Token identity is read only for cache cleanup; the backend authorizes requests. Notifications do not revoke issued tokens.

## Checkout and payment recovery

Guest and account checkout use Stripe's Payment Element and PaymentIntents. The server calculates prices and persists order snapshots; Stripe owns payment status, with backend webhooks and reconciliation applying updates. See [backend checkout guarantees](../../bookshop-server/docs/architecture.md#custom-checkout).

Async checkout results must match the current operation and payment ID. Stripe return identifiers take precedence over stored identity and are removed from the URL with any secrets before further requests. Aborted restoration retains the safe payment ID; unavailable sessions clear it. Transient failures are retryable, and status polling is bounded by the operation.

Identical creation retries reuse an idempotency key; changed carts and fresh attempts receive a new key. Contention retries are bounded by the current operation, cart, and retry key; exhaustion preserves the key for manual retry. Price conflicts refresh prices and require resubmission. USD totals round unit and discounted unit prices to cents, multiply by quantity, and sum integer cents.

Tabs share checkout identity/retry keys in local storage. A Web Lock serializes identity selection while network requests run outside the lock. Without it, simultaneous starts may create separate PaymentIntents; Stripe prevents duplicate successful payment per intent. Storage and foreground events synchronize cart intent and discard superseded sessions without implying payment success.

Submission rechecks shared identity after terms acceptance and confirmation. Uncertain confirmation results trigger a fresh status query; completed, processing, capturable, or canceled intents go to the status view. Failed recovery preserves the original error.

## Terms and CMS

Terms are immutable bilingual backend documents with current and archived public versions. Checkout loads the persisted order summary and current terms, then records acceptance of the version and language before Stripe confirmation. Missing terms, failed acceptance, or a changed version blocks submission; changes require renewed review and acceptance.

CMS publication creates revisions when content changes. The server's `canDelete` flag identifies unused versions; deleting the last publication makes checkout unavailable. See [backend terms guarantees](../../bookshop-server/docs/architecture.md#terms-publication-and-acceptance).

CMS order creation is disabled. Only customer/shipping corrections are editable; payment state, totals, currency, and item snapshots are read-only. Orders and users support reversible soft deletion; catalogue deletion is permanent. Order email history is fetched for the exact payment ID and exposes summaries without bodies, account links, or resend/delete actions.

## Localization and API contracts

i18next bundles English and Hungarian with the app and uses English as a fallback. Saved preferences override browser detection. Document language, dates, amounts, and Stripe Elements follow the active language. Tabs adopt saved preferences without writing them back to storage.

When configured, Locize refreshes each selected language in the background once per page load. The app renders from bundled translations immediately and overlays published strings as they arrive. Translation publishes follow the CDN's cache policy and take effect independently of app deploys.

API codes, roles, statuses, and filters retain their wire representations. Types describe public responses and commands. Errors are translated at display time from stable codes and sanitized validation metadata. See [backend response contracts](../../bookshop-server/docs/architecture.md#api-response-and-error-contracts).

Expected 4xx responses and intentional cancellations remain quiet. Final server/network failures are reported after retries without query strings, cookies, or authorization headers. Log uploads bypass reporting to prevent recursion.

## Runtime and development

`.node-version` pins Node.js; Vite produces static browser assets. Development runs local Vite alongside the [backend Docker stack](../../bookshop-server/docs/architecture.md#runtime-and-development).
