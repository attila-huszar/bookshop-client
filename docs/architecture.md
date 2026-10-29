# Frontend architecture

This document describes the application's boundaries, state ownership, authentication, checkout guarantees, and operational constraints. Database adapters, Stripe webhooks, reconciliation, and email delivery belong to the [backend](../../bookshop-server/docs/architecture.md).

## Application structure

React pages and hooks consume domain APIs from `src/store/api`. Services coordinate session and checkout workflows; transport modules own HTTP behavior; Redux slices own local intent and workflow state. Shared components expose folder-level entrypoints. Route definitions and constants remain separate so importing a route name does not initialize the router.

## Server data and local state

RTK Query is the single cache for catalogue data, profiles, orders, CMS entities, and payment HTTP requests. `bookshopApi.ts` owns the shared reducer, middleware, and cache tags. Domain modules register endpoints through `injectEndpoints`, allowing mutations to invalidate related queries across domains. Pages own subscriptions and loading/error presentation; loaders do not preload entity collections.

Redux slices hold cart IDs and quantities, authentication/session state, checkout workflow state, and filter/pagination UI. Server responses remain immutable and never replace cart intent. Filters are normalized before becoming query arguments so equivalent criteria reuse the same cache entry. Catalogue pagination uses `currentData` to avoid presenting results for a previous page or filter as current.

Endpoints opt into Ky's authenticated transport with `withAuth: true`. Guest payment requests also use that transport and explicitly include payment cookies. RTK Query owns server-data caching while Ky owns token attachment, cookies, and single-flight refresh.

Orders and CMS lists refresh on mount. Public queries use endpoint-specific freshness and retention settings; targeted prefetching shares their canonical entries. Private data is fetched only after route authorization. Authentication transitions clear private query data. API caches and payment tokens are never persisted to browser storage.

## Startup, routing, and cart recovery

The root `appLoader` restores the cookie session and validates saved cart intent before pages mount. Invalid stored carts restore as empty; startup does not fetch book details or repeat on ordinary navigation. Root and checkout recovery share `bootstrapSession`, including concurrent refresh work and bounded guest retry backoff.

Protected routes subscribe to the current profile and role. They wait for authorization before mounting private pages and react to session expiry or role changes. Transient profile failures offer retry rather than granting access or leaving the page indefinitely loading.

Cart reads subscribe to canonical book queries. Price-conflict recovery waits for older in-flight reads and then forces fresh requests, bypassing stale book cache entries without discarding basket quantities. The cart loader resumes an active checkout; the checkout loader restores its payment session. Product IDs are validated before querying.

## Authentication

Concurrent 401 responses share one token refresh. A request retries authentication at most once, and responses from an older session cannot refresh or expire a newer login. Logout waits for server cookie clearing before completing the local transition; a failed logout remains retryable.

Authentication forms ignore asynchronous completion after navigation. Registration country detection fills only an untouched selection. Email verification and reset-token previews share pending requests for the same token without caching completed results, so later attempts are validated again. Reset submission follows the current URL token and ignores stale completions.

## Checkout and payment recovery

The application preserves the custom Stripe Payment Element/PaymentIntent integration and supports authenticated and guest checkout. The server owns prices and immutable order snapshots. The return page displays Stripe status; only backend webhooks and reconciliation mark an order paid. See the [backend checkout guarantees](../../bookshop-server/docs/architecture.md#custom-checkout).

`src/services/checkout.ts` coordinates payment creation, restoration, and cancellation. It is the sole writer of the stored payment ID and accepted checkout transitions. The payment slice holds a minimal in-memory session, operation identity, workflow phase, and coded error. Responses pass strict validation before entering state. Payment tokens and full PaymentIntent responses are not persisted.

Recovery gives a Stripe return's payment ID precedence over an older stored checkout and strips Stripe IDs/secrets from the URL before further requests. Signed-in checkout waits for profile defaults; guest checkout and return-status display do not depend on a profile. Stripe's Address Element validates checkout address completeness.

Every asynchronous checkout result is checked against the current operation and payment ID. Resetting checkout invalidates older creates, reads, errors, and cancellations. Aborted restoration retains the safe payment ID; unavailable sessions clear it; transient failures remain retryable. A later restore waits for an older shared read before requesting fresh data.

Identical creation retries retain their idempotency key until the attempt succeeds or the server reports that checkout ended. Changed carts and explicit resets start a fresh attempt. Cart persistence resets checkout only when basket intent changes. A price conflict refreshes prices without automatically submitting another payment.

Status polling is bounded to three requests, with 5- and 10-second delays and a 30-second deadline. It ignores stopped requests, resets for another payment token, and retains the final result after checkout cleanup. Status data stays untranslated so language changes do not restart payment checks.

## Terms and CMS

Terms are immutable, versioned legal documents managed separately from interface translations. CMS publication creates a revision, including when editing historical text. RTK Query caches current terms, history, and immutable archives; publication invalidates the current document and history.

The server's `canDelete` flag governs deletion of terms already referenced by orders. Deletion refreshes affected history/archive/checkout queries. Removing the last publication makes terms unavailable and blocks checkout.

Checkout obtains the persisted order summary and current terms from `GET /api/payments/:paymentId/terms`. The customer must explicitly accept that version in the selected language before payment confirmation. The client posts `{ accepted: true, version, language }` and waits for server acceptance before calling Stripe. Refreshing checkout or changing language requires acceptance again. Missing terms or failed acceptance prevents submission.

Public `/terms` and `/terms/:version` routes expose current and archived documents without authentication, including downloads of the selected version and language. The [backend terms documentation](../../bookshop-server/docs/architecture.md#terms-publication-and-acceptance) describes acceptance persistence and remaining merchant obligations.

CMS order creation stays disabled. Only customer/shipping corrections are submitted; payment state, paid markers, totals, currency, and item snapshots are read-only and protected by backend allowlists. Orders and users support reversible soft deletion; catalogue deletion is permanent.

CMS order email history is scoped to the exact payment ID and fetched on demand. Summaries exclude bodies, account links, and lease tokens. The client offers no email resend or deletion command.

## Localization

English and Hungarian interface resources live in `public/locales` and load over HTTP through i18next. Both languages preload before the application renders; unavailable Hungarian resources fall back to English. Translation files remain separate deployment assets whose keys must match the application.

An explicit language choice is persisted and takes precedence over browser language detection. Automatic detection and loading fallbacks do not overwrite that preference. The document language, dates, amounts, and Stripe Elements locale follow the active interface language.

API codes, roles, payment statuses, and filter values retain their wire representations. Errors are translated when displayed, allowing language changes without refetching cached failures. Visible field validation errors are revalidated without resetting entered values. Versioned legal statements come from the server and are never automatically translated by the interface.

## API errors and logging

Client types describe public responses and commands rather than database records. Stable application error codes match the server's enums; validation responses include sanitized native Zod issue metadata. See the [backend response contracts](../../bookshop-server/docs/architecture.md#api-response-and-error-contracts).

`src/helpers/errors.ts` maps codes to localized messages. Unknown codes and unrecognized responses use a safe fallback. Rethrowing preserves the original cause and public API details without logging again. RTK Query retains serializable error data; components translate it at display time.

The shared request hook leaves expected 4xx responses quiet. Final 5xx, network, and timeout failures are logged after retries; recovered requests and intentional cancellations are silent. Auth retries do not duplicate reports. Request diagnostics exclude query strings, cookies, and authorization headers. Log uploads bypass the reporting hook to prevent recursion. Browser reports reach Loki through the API with `source="frontend"`.

## Development and verification

The client toolchain runs on Node.js; `.node-version` pins the supported build runtime. Production deploys static browser assets. Development scripts run local Vite alongside the backend's Docker Compose stack; container lifecycle and database setup are described in the [backend development notes](../../bookshop-server/docs/architecture.md#verification-and-production-follow-ups).

Tests use real application hooks, stores, and routing where practical, with isolated browser/provider mocks. Coverage focuses on session transitions, cache invalidation and isolation, cart persistence, checkout recovery/idempotency, authentication flows, and translation consistency. Test/build scripts live in `package.json`; provider, webhook, database, and email checks belong to backend verification.
