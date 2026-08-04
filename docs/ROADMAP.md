# E-commerce Feature Roadmap

Sprint-by-sprint plan to close the feature gaps between Naya Store and Amazon/Shein/Trendyol, identified via a full codebase audit. Sprints are ordered by dependency, not calendar time — pick up wherever the backlog currently stands (see the summary table in [CLAUDE.md](../CLAUDE.md)).

Three hard dependencies drive the ordering:
- **Returns/RMA** (Sprint 7) needs the shipment/order-status model from **Order Tracking** (Sprint 6).
- **Frequently-bought-together** (Sprint 9) is stronger with a real category tree from **Category Hierarchy** (Sprint 3).
- **Abandoned Cart Recovery** (Sprint 10) needs the email capture flow introduced by **Guest Checkout** (Sprint 1).
- **i18n** (Sprint 16) is scheduled last so it doesn't have to be retrofitted into UI still being built in every earlier sprint.

---

## Sprint 1 — Checkout & Discoverability Foundations

**Features:** Guest checkout, SEO plumbing (sitemap/robots/JSON-LD), Analytics/pixels

**Why now:** All three are low-risk, high-leverage, and independent of everything else — good first sprint to build momentum and unblock later sprints (guest email capture feeds Sprint 10).

**Key tasks:**
- Guest checkout: loosen the route guard in `auth.config.ts` currently forcing sign-in on `/shipping-address`, `/payment-method`, `/place-order`. The guest-cart mechanism (`sessionCartId` cookie) already works — extend it to carry an email captured inline at shipping-address step. Offer "create an account" as a post-purchase upsell, not a gate.
- SEO: add `app/sitemap.ts` and `app/robots.ts` using Next.js App Router conventions. Add JSON-LD product schema (`<script type="application/ld+json">`) to `app/product/[slug]/page.tsx`, sourced from the same product data already used for `generateMetadata`.
- Analytics: add GA4/Meta Pixel script components to `app/layout.tsx`, gated behind env vars so they're opt-in per environment.

**Acceptance criteria:** A logged-out user can complete checkout end-to-end without hitting a sign-in wall. `/sitemap.xml` and `/robots.txt` resolve and list real product/category URLs. A PDP view fires a pageview event in GA4/Meta debug tools. Product pages expose valid JSON-LD (validate with Google's Rich Results Test).

---

## Sprint 2 — Post-Purchase Quick Wins

**Features:** One-click reorder, Back-in-stock email alert

**Why now:** Both are small, isolated additions on top of existing models — no schema risk, immediate retention value.

**Key tasks:**
- Reorder: new server action that reads an `Order`'s `OrderItem` rows (productId/variantId/qty already stored) and re-adds them to the current cart. Add a "Buy again" button to the order history list in `app/user/orders`.
- Back-in-stock: new `StockAlert` model (email, productId). Add a signup control to the out-of-stock state on the PDP. On stock replenishment (admin product update), fire a Resend email following the existing pattern in `email/purchase-receipt.tsx`.

**Acceptance criteria:** Reordering a past order populates the cart with the same items (falling back gracefully if a variant/product was discontinued). Signing up for a back-in-stock alert on a 0-stock product and then restocking it via the admin panel sends the alert email.

---

## Sprint 3 — Search & Merchandising Data Foundations

**Features:** Attribute filters in search (color/size), Category hierarchy

**Why now:** Both are data-layer foundations. Category hierarchy in particular unlocks Sprint 9 (bundles) and gives Sprint 12+'s recommendation work a real taxonomy to reason over.

**Key tasks:**
- Attribute filters: extend the `/search` page's query params and filter UI to facet on `ProductVariant.color` / `.size` — this data already exists per-variant, it's just not surfaced as a filter today.
- Category hierarchy: promote the existing `CategoryMeta` model (currently just tile name/image) into a real relational `Category` model with a self-referential `parentId` for subcategories. Migrate `Product.category` from a free-text string to a foreign key, with a data migration script for existing rows.

**Acceptance criteria:** `/search?color=black&size=M` returns only matching variants. Admin can create a subcategory under a parent category, and products can be assigned to it; category-based browsing reflects the new hierarchy.

---

## Sprint 4 — Checkout Depth

**Features:** Address book (multiple addresses), Saved payment methods

**Why now:** Both directly attack repeat-checkout friction, which is the single biggest UX gap vs. Amazon specifically. Natural pairing since both live on the checkout flow.

**Key tasks:**
- Address book: new `Address` model replacing the single `User.address` JSON blob. CRUD UI under `app/user/`, with a selector (plus "add new") at `/shipping-address`.
- Saved payment methods: use Stripe Setup Intents + Stripe Customer objects (Stripe is already wired in `app/order/[id]/stripe-payment.tsx`) to store reusable payment methods, replacing today's plain string label on `User.paymentMethod`.

**Acceptance criteria:** A returning user can select from 2+ saved addresses at checkout without re-typing. A user can save a card once and reuse it on a subsequent order without re-entering card details.

---

## Sprint 5 — Pricing Infrastructure

**Features:** Multi-currency

**Why now:** Self-contained pricing/display change; best done once checkout (Sprint 4) is stable so currency formatting has one settled checkout path to thread through.

**Key tasks:** Replace the hardcoded `Intl.NumberFormat('en-US', { currency: 'USD' })` in `lib/utils.ts` with a currency-aware formatter driven by an FX-rate source (cached, periodically refreshed) and a user/locale currency preference.

**Acceptance criteria:** Switching the displayed currency updates prices storefront-wide (PDP, cart, checkout, order history) consistently, and the value charged at checkout matches what was displayed.

---

## Sprint 6 — Fulfillment Visibility

**Features:** Order tracking / shipment status

**Why now:** Foundational for Sprint 7 (Returns) — a return needs to know what was actually shipped and when.

**Key tasks:** New `Shipment` model (carrier, tracking number, status enum, timestamps) linked to `Order`, replacing the current `isPaid`/`isDelivered` boolean-only state. Add a status timeline UI to `app/order/[id]`.

**Acceptance criteria:** An order detail page shows a real status timeline (placed → shipped → out for delivery → delivered), not just paid/delivered booleans. Admin can update shipment status and attach a tracking number.

---

## Sprint 7 — Post-Purchase Service

**Features:** Returns/RMA workflow

**Depends on:** Sprint 6 (needs shipment/order status to validate return eligibility windows).

**Key tasks:** New `Return` model (orderId, items, reason, status). Customer-facing return request form replacing the static "30-day returns" marketing copy currently in `product-details-client.tsx` / `footer.tsx`. Admin approval queue in `app/admin`.

**Acceptance criteria:** A customer can request a return on a delivered order within the policy window; admin can see, approve/reject, and track the return through to resolution.

---

## Sprint 8 — Social Proof

**Features:** Photo reviews + helpful votes + seller replies

**Why now:** Independent of the fulfillment/returns work above; boosts conversion on PDPs.

**Key tasks:** Extend `Review` model with `images[]` (reuse the UploadThing integration already used for product images), `helpfulCount`, and a reply field. Update `review-form.tsx` and `review-list.tsx` accordingly.

**Acceptance criteria:** A reviewer can attach photos to a review. Other users can mark a review helpful, and reviews can be sorted by helpfulness. Admin/seller can post a visible reply to a review.

---

## Sprint 9 — Cross-sell

**Features:** Frequently-bought-together / bundles

**Depends on:** Sprint 3 (category hierarchy improves bundle relevance).

**Key tasks:** Extend the existing `getCartUpsells` logic (`lib/actions/product.action.ts`) into a PDP-level "frequently bought together" module, backed by either a simple co-purchase association table or a lightweight bundle/kit model with its own bundle pricing.

**Acceptance criteria:** PDP shows a "frequently bought together" module with an "add all to cart" action; admin can optionally curate bundle pricing for specific product groups.

---

## Sprint 10 — Retention Automation

**Features:** Abandoned cart recovery email

**Depends on:** Sprint 1 (guest email capture — carts without a captured email can't be recovered).

**Key tasks:** Scheduled job (cron) scanning carts with no recent activity, sending a reminder via the existing Nodemailer/Gmail SMTP pattern (`email/purchase-receipt.tsx` as a template reference) — note the Sprint 2 log's gotcha about Gmail's sending cap and lack of domain-level SPF/DKIM/DMARC before relying on it at volume.

**Acceptance criteria:** A cart abandoned for the configured threshold triggers exactly one reminder email to the associated address (registered user or guest email captured in Sprint 1), with no duplicate sends.

---

## Sprint 11 — Loyalty & Gift Cards

**Features:** Loyalty/points program, Gift cards

**Key tasks:**
- Loyalty: new `LoyaltyAccount` / `PointsLedger` models. Points earned on order completion (hook into the same flow that marks an order paid/delivered), redeemable at checkout as a discount.
- Gift cards: new `GiftCard` model (code, balance). Redemption reuses the existing coupon-application pattern in `lib/actions/coupon.actions.ts`.

**Acceptance criteria:** Completing an order credits points to the account, visible in the user profile. A gift card code applied at checkout reduces the order total and decrements the card's remaining balance.

---

## Sprint 12 — Support & Experimentation Infra

**Features:** Live chat/support widget, A/B testing framework

**Why now:** Both are largely buy-vs-build integrations rather than custom features — confirm the specific vendor (e.g. Crisp/Intercom for chat, GrowthBook/PostHog for experimentation) with the user before starting this sprint, since that choice isn't yet decided.

**Key tasks:** Embed the chosen chat widget script/component. Wire the chosen experimentation SDK for at least one real A/B test (a good candidate: PDP layout or checkout copy) to validate the integration end-to-end.

**Acceptance criteria:** Chat widget is reachable from any storefront page. An A/B test can be created, targets a real page, and reports results through the chosen platform's dashboard.

---

## Sprint 13 — Mobile & Personalization

**Features:** PWA support, Personalized recommendations

**Key tasks:**
- PWA: `next-pwa` plugin, `manifest.json`, service worker wiring in `next.config.ts`.
- Recommendations: start with a co-view/co-purchase association table as a first step beyond the current same-category `getRelatedProducts` logic (rating-sorted, same category only today) — no need for a full ML service yet.

**Acceptance criteria:** The storefront is installable as a PWA on mobile and works offline for previously-viewed pages. "Recommended for you" surfaces items based on actual browsing/purchase co-occurrence, not just category + rating.

---

## Sprint 14 — Recurring Revenue

**Features:** Subscriptions/recurring orders

**Key tasks:** Use Stripe Billing (Stripe already integrated) for subscription plans. Needs product/plan modeling and a recurring-fulfillment flow that reuses the existing `Order`/`OrderItem` pipeline rather than duplicating it.

**Acceptance criteria:** A customer can subscribe to recurring delivery of a product; Stripe Billing correctly triggers repeat charges and each cycle produces a real fulfillable `Order`.

---

## Sprint 15 — Growth

**Features:** Affiliate/referral program

**Key tasks:** New referral-code + attribution tracking model (who referred whom, and on what order). Scope payout mechanics as a separate follow-on once attribution tracking is verified working.

**Acceptance criteria:** A referral code can be generated, shared, applied by a new customer at signup/checkout, and correctly attributed back to the referrer.

---

## Sprint 16 — Internationalization

**Features:** i18n/multi-language

**Scheduled last:** By this point the UI surface from Sprints 1–15 is settled, so locale support isn't retrofitted twice.

**Key tasks:** `next-intl` (or equivalent) App Router i18n routing. Touches nearly every page — the largest lift on this roadmap.

**Acceptance criteria:** The storefront is fully navigable and transactable in at least one additional locale, with all customer-facing strings (including transactional emails) translated.
