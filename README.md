# DopaBerry

A production-oriented Next.js storefront for dopamine-inspired mobile
accessories. The first release supports a typed product catalog, responsive
shopping experience, persistent guest cart, server-validated Stripe Checkout,
verified Stripe webhooks, technical SEO, legal-policy drafts, and automated
quality gates.

The brand uses “dopamine-inspired” as a visual idea—bright color, playful form,
and satisfying details. The site intentionally makes no medical or wellness
claims.

## Stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 4 plus a custom token-based design system
- Zustand for a versioned, sanitized local cart
- Stripe-hosted Checkout and signature-verified webhooks
- Zod for API boundary validation
- Vitest for unit tests
- Playwright for desktop and mobile smoke tests
- ESLint, Prettier, and GitHub Actions

## Local setup

Requirements:

- Node.js 22.14 or newer on the Node 22 LTS line. CI installs the version in `.nvmrc`.
- npm 10.9.2
- A Stripe account in test mode for checkout. A restricted key is preferred; a secret test key also works.
- Stripe CLI for local webhook testing

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

The storefront builds and can be explored without Stripe credentials. Checkout
returns a clear configuration error until `COMMERCE_MODE=test`, a valid site
URL, and a real Stripe test secret are configured. Placeholder values ending in
`replace_me` are treated as unconfigured.

On Windows, prefer a local path outside OneDrive for day-to-day development.
OneDrive can lock Next.js native SWC files during installs and cause `EPERM`
cleanup warnings.

## Environment contract

`NEXT_PUBLIC_SITE_URL`

- Canonical public origin with no path.
- Use `http://localhost:3000` locally.
- Set this to `https://dopaberry.com` in production.
- This value creates checkout return URLs, canonical links, sitemap entries,
  and structured data.

`COMMERCE_MODE`

- Explicit payment safety switch: `disabled`, `test`, or `live`.
- `test` accepts `sk_test_` or `rk_test_` Stripe keys.
- `live` accepts `sk_live_` or `rk_live_` keys and requires a non-local HTTPS site URL.
- Prefer a restricted key (`rk_`) with Checkout Session read and write access. Secret keys still work.
- Keep previews and CI set to `disabled` unless they intentionally test Stripe.

`STRIPE_SECRET_KEY`

- Stripe test or live secret key.
- Server-only. Never add a `NEXT_PUBLIC_` prefix.

`STRIPE_WEBHOOK_SECRET`

- Signing secret for this exact webhook endpoint.
- Local CLI secrets and production Dashboard secrets are different.
- The server pins Stripe API version `2026-09-30.endive` through stripe-node 23. Create the webhook endpoint on that version so event payloads match the route.

## Stripe workflow

1. Set `COMMERCE_MODE=test` and put a Stripe test secret in `.env.local`.
2. Sign in with Stripe CLI.
3. Forward test events:

```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.
5. Restart the development server after changing environment variables.
6. Add a catalog item to the cart and continue to Checkout.
7. Use a Stripe test card such as `4242 4242 4242 4242`, any future
   expiration date, and any CVC.

Checkout intentionally accepts only product IDs, variant IDs, quantities, and
a unique attempt ID from the browser. Product names and prices are looked up
again from the server-owned catalog. Client-supplied prices and unknown
variants are rejected. The browser keeps one checkout-attempt ID for the
current cart state, reuses it for retries, and blocks concurrent submissions.
Stripe uses that ID as the idempotency key. Changing the cart creates a new
attempt. Confirmed and completed-but-unpaid sessions are tracked separately so
a later cart change does not prevent purchased lines from being reconciled.
Canceling rotates the current attempt and keeps the canceled id until that
session is reconciled. An expired session rotates the current attempt.

The webhook bounds the raw payload, verifies it with Stripe, and ignores
Checkout sessions that do not carry valid DopaBerry ownership metadata. It
records structured, non-PII event metadata for:

- completed checkout sessions
- successful or failed delayed payments
- expired checkout sessions

For the initial low-volume launch, Stripe remains the payment source of truth.
Before automated fulfillment or meaningful order volume, connect the webhook
to durable order storage and enforce event-ID uniqueness in a database. Never
trigger fulfillment from the browser success page.

## Commands

```powershell
npm run dev             # local development
npm run lint            # ESLint with zero warnings
npm run typegen         # generate Next.js route and environment types
npm run typecheck       # typegen + strict TypeScript
npm test                # Vitest unit suite
npm run test:coverage   # unit coverage report
npm run build           # optimized production build
npm run check           # format + lint + typecheck + unit tests + build
npm run check:all       # complete quality gate including browser tests
npm run format          # apply Prettier formatting
npm run format:check    # verify formatting
```

To run browser tests:

```powershell
npx playwright install chromium
npm run test:e2e
```

The browser command creates a production build and tests both desktop Chromium
and a mobile Chrome viewport against `next start`.

## Architecture

Key areas:

- `src/app` contains routes, metadata, generated social imagery, API route
  handlers, error boundaries, and policy pages.
- `src/components` contains client interactions and reusable storefront UI.
- `src/lib/catalog.ts` is the current server-owned product source.
- `src/lib/cart-store.ts` owns the versioned browser cart and sanitizes
  persisted input during hydration.
- `src/lib/checkout-schema.ts` defines the only accepted checkout payload.
- `src/lib/stripe.ts` creates a cached, server-only Stripe client.
- `tests/e2e` covers core customer journeys in real browsers.

The catalog is deliberately static for the first release. This keeps browsing
fast, statically renders product pages, and avoids adding a database before the
business needs one. Move products, variants, inventory, and orders to Postgres
when one or more of these becomes true:

- inventory changes independently of deploys
- staff need an admin workflow
- fulfillment must be automated
- refunds and returns need internal state
- multiple sales channels share stock

At that point, use a managed Postgres provider, database migrations, immutable
order snapshots, webhook event deduplication, and transactional inventory
updates.

## Security and reliability decisions

- Stripe Checkout reduces PCI scope; card data never passes through this app.
- Prices are resolved server-side from trusted catalog data.
- Checkout JSON is strict, bounded, and validated before Stripe is called.
- Cross-site browser checkout requests are rejected.
- Webhook signatures are mandatory.
- Secrets are server-only and local environment files are ignored by Git.
- Checkout and account-like pages are excluded from search indexing.
- Security headers include CSP, clickjacking protection, MIME sniffing
  protection, a strict referrer policy, and a restrictive permissions policy.
  HSTS and insecure-request upgrading are enabled only for the canonical live
  HTTPS deployment.
- The cart stores identifiers and quantities only, never authoritative price.
- Checkout errors return safe customer copy while server logs retain a
  structured diagnostic event.
- The success page verifies payment directly with Stripe before showing a paid
  confirmation. It reconciles only purchased cart lines associated with a known
  local checkout attempt, preserving items added afterward.
- `/api/health` is a liveness endpoint. `/api/ready` returns `503` when enabled
  commerce is misconfigured; live-mode builds also fail fast on invalid domain
  or Stripe secrets.

## Launch checklist

This repository is technically deployable, but the following business inputs
must be completed before accepting live payments:

1. Register or connect `dopaberry.com`, configure DNS, and verify HTTPS.
2. Create the production Vercel project and set all environment variables.
3. Complete Stripe business verification and switch from test to live keys.
4. Register the production webhook URL and use its production signing secret.
5. Replace all fixture catalog copy, pricing, SKUs, device compatibility, and
   CSS product illustrations with verified merchandise data and optimized
   product photography.
6. Test every case against the exact phone or AirPods model it names.
7. Confirm packaging, inventory, shipping rates, delivery windows, and the
   free-shipping threshold.
8. Add the legal business name, physical or statutory contact address, and
   governing jurisdiction, then have privacy, terms, shipping, and returns
   language reviewed for the actual selling regions.
9. Confirm that `hello@dopaberry.com` exists and is monitored.
10. Connect a durable order and fulfillment workflow to verified webhook
    events.
11. Configure production rate limiting or WAF rules for checkout, webhook, and
    dynamic confirmation endpoints.
12. Perform a complete Stripe live-mode purchase, refund, failed payment,
    canceled checkout, and webhook retry test.
13. Add error monitoring and privacy-respecting analytics only after the
    relevant account IDs and consent requirements are known.
14. Run `npm run check:all` against the release candidate.

Do not launch with placeholder catalog data or treat the included legal text as
legal advice.

## Product and growth recommendations

- Start with a narrow, coherent first drop of 8–12 products. Deep compatibility
  and strong photography will outperform a broad, inconsistent catalog.
- Keep guest checkout. Add accounts only when order history, loyalty, or
  subscriptions create a clear customer benefit.
- Use Stripe promotion codes for controlled campaigns instead of client-side
  discount arithmetic.
- Do not publish invented reviews or urgency. Collect verified post-purchase
  feedback after fulfillment is reliable.
- Create compatibility landing pages with real search demand once product data
  is finalized, for example specific iPhone model and AirPods generation
  collections.
- Track the funnel from product view to add-to-cart, checkout start, purchase,
  refund, and return reason. Avoid installing several overlapping trackers.
- Photograph color consistently under controlled lighting and include
  dimensions, materials, fit, charging behavior, and care instructions.
- Preserve the explicit no-medical-claims language. “Dopamine” is the brand
  aesthetic, not a promise that an accessory changes brain chemistry.

## Deployment

Vercel is the simplest hosting target for this App Router application:

1. Push the repository to a private GitHub repository.
2. Import it into Vercel.
3. Add production and preview environment variables separately.
4. Set the production domain to `dopaberry.com` and redirect `www` consistently.
5. Point Stripe to
   `https://dopaberry.com/api/webhooks/stripe`.
6. Subscribe the endpoint to the checkout session events handled in the route.
7. Deploy and verify `/api/health` for liveness and `/api/ready` for
   configuration readiness. Neither endpoint makes an external Stripe request.
8. Inspect response security headers and complete the live-mode payment test.

After the initial commit is pushed, GitHub Actions runs the same lint, type,
unit, build, and browser gates used locally. Browser reports and traces are
uploaded automatically when CI fails.
