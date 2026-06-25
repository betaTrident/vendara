You are a senior UX/UI designer, frontend product strategist, and product-minded admin dashboard designer.

Your task is to create a complete redesign plan for the Vendara MVP UI. This is a planning/documentation task only. Do not implement code yet.

Create a new Markdown file named:

`UI-REDESIGN-PLAN.md`

The file must be clean, structured, developer-ready, and specific enough for a frontend developer to rebuild the UI from it.

## Project Context

Vendara is currently a sari-sari store pricelist and customer ledger system.

The current MVP domain is:

- Product pricelist management
- Cost price and selling price tracking
- Product price history
- Customer records
- Customer debt / utang ledgers
- Debt entries
- Payment entries
- Running customer balances
- Admin login/session UI

The MVP direction is now **admin-only**.

Remove or ignore customer-side/public-facing UI from the redesigned product direction. The new app should feel like a focused, polished internal admin system for a store owner or staff member, not a marketplace, booking app, ecommerce shop, or customer-facing catalog.

Do not introduce:

- Public marketplace browsing
- Customer-facing product search
- Bookings or reservations
- Property listings
- Guest/host concepts
- Ecommerce checkout
- Stock tracking
- Inventory movement
- Category management
- Customer accounts
- Payment gateway flows
- Marketing landing pages

Preserve and redesign only the admin-relevant workflows.

## Required Discovery Before Writing The Plan

Before writing `UI-REDESIGN-PLAN.md`, inspect the current project structure and identify the real UI surfaces.

At minimum, review:

- Current routes/pages
- Current admin components
- Current public/customer-facing components
- Current global styling and design tokens
- Existing MVP/product plan files
- The visual reference file: `DESIGN-airbnb.md`

Ground the plan in the actual codebase. Do not invent unrelated sections or generic SaaS pages that do not fit Vendara.

## Main Visual Reference

Use this file as the main visual reference:

`DESIGN-airbnb.md`

Use the Airbnb-inspired principles from that file as inspiration:

- Clean white canvas
- Generous but practical spacing
- Soft rounded corners
- Minimal, high-impact accent color usage
- Modern typography
- Clear hierarchy
- Restrained shadows
- Strong responsive behavior
- Polished component states
- Friendly, premium, accessible feel

Important: Use Airbnb as a visual inspiration source, not as a literal clone.

Do not copy Airbnb branding, wordmarks, property-card patterns, guest/host language, booking/reservation concepts, travel marketplace layouts, or proprietary font assumptions.

Adapt the design principles into a practical admin dashboard for Vendara.

The UI should feel:

- Clean
- Premium
- Professional
- Calm
- Organized
- Trustworthy
- Mobile-friendly
- Fast to scan
- Easy for non-technical admins to use

## Existing Visual System To Replace

The current UI has an Industrial Atelier-style visual language with orange/brown accents, sharp radii, double-bezel cards, mono labels, heavy utility classes, and `ia-*` styling patterns.

The redesign plan should explain how to replace that current visual language with a cleaner Airbnb-inspired admin system.

The plan should explicitly address removal or replacement of:

- Old global visual tokens
- Orange/brown industrial palette
- Double-bezel card patterns
- Heavy mono-label dashboard styling
- Overly decorative gradients
- Cluttered component wrappers
- Public catalog styling
- Customer-facing UI patterns
- Inconsistent spacing, borders, shadows, and radii

Preserve useful domain behavior and component logic only where it supports the new admin workflows.

## Admin-Only Product Direction

The redesigned app should focus on these admin sections:

1. Dashboard
2. Products & Pricing
3. Price History
4. Customers
5. Customer Ledgers
6. Debt Entries
7. Payments
8. Reports / Summaries, only if useful for the current MVP
9. Settings / Admin Session

If a section does not fit the current MVP, explain whether it should be omitted, merged, or deferred.

The app should prioritize daily store-owner workflows:

- Quickly see total products, customers, and outstanding balance
- Add/edit products and prices
- Review product price changes
- Find a customer quickly
- Open a customer ledger
- Add debt entries
- Add payments
- Review running balance and ledger history
- Handle errors and empty states clearly

## Route And Page Direction

Because the MVP is now admin-only, define what should happen to the current public/customer-facing root route.

The plan must recommend one clear direction:

- Remove the public catalog UI
- Make `/` redirect to `/admin`, or make `/` the admin entry screen
- Remove customer-facing copy and navigation
- Keep only admin-needed API/domain behavior
- Avoid leaving a half-public app shell behind

The plan should identify every existing page/screen and classify it as:

- Keep and redesign
- Merge into another admin screen
- Remove
- Rebuild
- Defer

## Required Sections In `UI-REDESIGN-PLAN.md`

Write the final Markdown document with these sections.

### 1. Current UI Cleanup Strategy

Explain how to strip out the current visual design before rebuilding.

Include:

- What existing CSS/design tokens should be removed or replaced
- What public/customer UI should be removed
- What admin functionality should be preserved
- What component logic can remain
- What styling patterns should not be carried forward
- How to avoid breaking product, customer, ledger, and auth workflows while cleaning the UI

### 2. New Design Direction

Define the new Airbnb-inspired admin visual style.

Include guidance for:

- Color palette
- Typography
- Spacing scale
- Border radius
- Borders and dividers
- Shadows/elevation
- Cards and panels
- Buttons
- Forms
- Tables
- Navigation
- Dialogs/drawers
- Empty/loading/error states
- Motion and micro-interactions

Make the design admin-focused, not consumer marketplace-focused.

Use clean white surfaces, near-black text, soft neutral backgrounds, subtle dividers, restrained shadows, and one primary accent color used sparingly.

### 3. Admin-Only Information Architecture

Plan the new admin app structure.

Include:

- Recommended primary navigation
- Sidebar vs top navigation recommendation
- Desktop layout
- Tablet layout
- Mobile layout
- Main sections and sub-sections
- Which sections should be first-class pages vs tabs/panels
- How the dashboard connects to products, customers, and ledgers

Use Vendara-specific labels. Avoid generic “listings,” “bookings,” or “marketplace” labels.

### 4. Page-By-Page Redesign Plan

For every current UI surface, explain how it should be redesigned.

Cover at least:

- Admin login/session screen
- Admin dashboard
- Products & Pricing
- Product price history
- Customers
- Customer ledger detail
- Debt entry flow
- Payment flow
- Settings/admin session controls
- Current public catalog/root route

For each page/screen, include:

- Purpose
- Keep/merge/remove/rebuild decision
- Recommended layout
- Main components
- Empty state
- Loading state
- Error state
- Responsive behavior
- Important interaction details

### 5. Component System

Plan reusable admin components.

Include:

- Admin sidebar or top navigation
- App header/top bar
- Dashboard stat cards
- Section headers
- Data tables
- Search and filter bars
- Product form
- Customer form
- Debt entry form
- Payment form
- Price history drawer/dialog
- Customer ledger timeline
- Customer list/detail layout
- Confirmation dialogs
- Empty states
- Loading skeletons
- Error banners
- Toast notifications
- Buttons
- Badges/status indicators
- Inputs, selects, textareas, and labels
- Mobile drawer/sheet patterns

Components must be accessible, responsive, visually consistent, and practical for repeated admin use.

### 6. Responsive Design Plan

Explain how the admin UI adapts across:

- Desktop
- Tablet
- Mobile

Include:

- Sidebar collapse behavior
- Mobile navigation behavior
- Table-to-card responsive behavior
- Form stacking
- Card grid behavior
- Ledger timeline behavior
- Customer list/detail behavior
- Sticky action behavior where useful
- Touch target sizing
- Avoiding cramped mobile layouts

The mobile UI should remain usable for a store owner doing quick updates, not just visually responsive.

### 7. Accessibility Improvements

Include practical accessibility rules:

- Sufficient color contrast
- Keyboard navigation
- Visible focus states
- Proper labels
- Semantic headings
- Form validation messages
- Error recovery
- Touch targets
- Screen-reader-friendly dialogs
- Non-color-only status indicators
- Clear destructive action confirmations
- Reduced-motion considerations

Write this section as implementation guidance, not abstract accessibility theory.

### 8. Design Tokens

Create a recommended token system inspired by `DESIGN-airbnb.md` but adapted for Vendara admin use.

Include:

- Color tokens
- Typography tokens
- Spacing tokens
- Radius tokens
- Shadow tokens
- Border tokens
- Layout width tokens
- Z-index/modal layering tokens if useful
- Component-level token recommendations

Use practical open-source font assumptions such as Inter or Geist if Airbnb Cereal is unavailable.

The token system should be ready for Tailwind/CSS variable implementation later, but do not write implementation code.

### 9. Implementation Roadmap

Break the redesign into realistic phases:

- Phase 1: Audit and remove old UI/customer-side design
- Phase 2: Build base layout and design tokens
- Phase 3: Rebuild shared components
- Phase 4: Redesign admin pages one by one
- Phase 5: Polish responsiveness, accessibility, and micro-interactions
- Phase 6: Final QA and cleanup

For each phase, include:

- Goal
- Key tasks
- Files/areas likely affected
- Acceptance criteria
- Risks or dependencies

Keep the roadmap practical for a frontend developer.

### 10. Acceptance Criteria

Define how we know the redesign plan is successful.

Include criteria such as:

- The plan is admin-only
- No customer/public marketplace UI remains in the target design
- Product, price history, customer, ledger, debt, and payment workflows are all covered
- Airbnb-inspired design is adapted, not copied
- Existing Industrial Atelier styling is explicitly replaced
- The design system is consistent
- Mobile behavior is specified
- Accessibility is specified
- A developer can implement the redesign from the plan without guessing major product decisions

## Writing Requirements

- Write the entire output as a polished Markdown document.
- Save it as `UI-REDESIGN-PLAN.md`.
- Do not write application code.
- Do not edit unrelated files.
- Do not add new features outside the current MVP.
- Do not introduce stock tracking, categories, bookings, ecommerce, marketplace flows, or customer account features.
- Be concrete and implementation-ready.
- Prefer tables where they improve clarity.
- Use clear headings and action steps.
- Keep the tone professional, direct, and developer-friendly.

## Final Deliverable

Create only this file:

`UI-REDESIGN-PLAN.md`

The file should be a complete, repo-grounded redesign plan for rebuilding Vendara as a clean, modern, Airbnb-inspired, admin-only web application.