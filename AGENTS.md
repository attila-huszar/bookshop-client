# Coding-agent instructions

- For auth, checkout, payments, and email changes, consider this repo and `../bookshop-server` together. Check the server repo before reporting a requested server path missing.
- Preserve custom Stripe Payment Element/PaymentIntent checkout, guest checkout, and the backend's dual-database learning goals.
- RTK Query owns server data. Do not reintroduce parallel books/authors/news/orders/CMS entity caches or mutate query responses. Keep cart intent, auth/session state, payment workflow, and filter/pagination UI in their dedicated slices.
- Keep Ky's single-flight token refresh and cookie behavior intact. Clear private query data on authentication/session transitions.
- Cart price-conflict recovery must bypass stale book cache entries. Preserve checkout idempotency across identical retries; a changed cart/fresh attempt needs a new key.
- Do not persist Stripe payment tokens or full PaymentIntent responses. Own variables use `paymentToken`; Stripe SDK/wire property names remain unchanged.
- CMS order Add stays disabled. Payment/pricing fields are read-only; only customer/shipping corrections are submitted.
- Types describe API responses/commands, not internal database fields. User responses must not include password hashes or verification/reset tokens.
- All Git operations are performed by the user. Do not run any Git commands unless explicitly instructed. Respect user changes. Use `rg` for search and `apply_patch` for edits.
- Keep control flow readable: use braces for guards/loops and blank lines before returns/switches and between logical sections. Avoid rest destructuring in function parameters; prefer named parameters or typed input objects.
- Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:ci`, and `npm run build` (Bun can run these package scripts too).
- Keep README.md focused on project basics and setup. Put feature, architecture, and operational details in `../bookshop-server/docs/architecture.md`; keep agent instructions here.
