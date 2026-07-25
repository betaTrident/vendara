# Vendara UI Design System

> UI/UX specification for the Vendara private sari-sari store administration PWA.

---

## 1. Product Overview

Vendara is a private administrative system designed for sari-sari store owners and approved store administrators.

The application helps administrators:

* Manage product names and prices
* Track product cost and selling price changes
* Manage customer credit accounts
* Record purchases made on credit
* Record customer payments
* Track outstanding balances
* Review customer transaction history

Vendara is intended for internal store administration only.

It is not:

* A public online store
* A public product catalog
* A point-of-sale checkout system
* An inventory or stock-tracking system
* A customer-facing payment application

---

## 2. Design Goals

The Vendara interface should feel:

* Modern
* Clean
* Minimal
* Professional
* Friendly
* Trustworthy
* Fast to use
* Easy to understand
* Mobile-first
* Responsive
* PWA-friendly
* Appropriate for everyday store administration

The design should avoid generic dashboard patterns that add visual noise without improving usability.

Every section should have a clear purpose, strong information hierarchy, and obvious primary action.

---

## 3. Design Principles

### 3.1 Clarity First

Important information should be understandable at a glance.

Examples:

* Customer balances must be immediately visible
* Purchases and payments must be visually distinguishable
* Forms must clearly show what will happen before submission
* Product prices must clearly separate cost price and selling price

### 3.2 One Primary Action per Screen

Each page should emphasize one primary task.

Examples:

* Products: Add Product
* Customers: Add Customer
* Customer Ledger: Record Purchase or Record Payment
* Record Credit Purchase: Confirm Credit Purchase
* Record Payment: Confirm Payment
* Offline Screen: Try Again

Secondary actions should remain visually quieter.

### 3.3 Progressive Disclosure

Advanced information should appear only when useful.

Examples:

* Filters remain collapsed until opened
* Add and edit forms open in sheets, drawers, or modals
* Detailed transaction notes remain secondary
* Product price history is accessed from the product record

### 3.4 Touch-Friendly Interaction

All interactive controls must work comfortably on mobile devices.

Recommended minimum touch target:

```text
44 × 44 px
```

Buttons, navigation items, table actions, quantity controls, and form fields must have sufficient spacing.

### 3.5 Consistency

The same interaction should behave the same way throughout the application.

Examples:

* Primary buttons use the same color and shape
* Forms use the same field spacing
* Currency values use the same formatting
* Success and warning messages use consistent colors
* Destructive actions always require confirmation

---

## 4. Visual Direction

Vendara uses a soft, modern administrative interface with:

* Bright neutral surfaces
* Soft blue, cyan, indigo, and violet accents
* Spacious layouts
* Rounded cards
* Subtle borders
* Low-intensity shadows
* Clear typography
* Friendly icons
* Controlled use of gradients
* Strong mobile responsiveness

The visual style should feel premium but practical.

The interface should not rely on:

* Heavy glassmorphism
* Excessive gradients
* Large decorative illustrations on operational pages
* Tiny text
* Overly dense tables
* Excessive cards
* Decorative charts without administrative value
* Unnecessary animations
* Generic AI dashboard visuals

---

## 5. Brand Identity

### 5.1 Brand Name

```text
Vendara
```

### 5.2 Brand Personality

Vendara should communicate:

* Trust
* Simplicity
* Organization
* Confidence
* Warmth
* Reliability
* Modern administration

### 5.3 Logo

The primary Vendara logo consists of:

* A folded ribbon-style `V` symbol
* A blue-to-cyan gradient
* A dark navy wordmark
* Rounded geometric construction

The logo may be used in the following variants:

1. Horizontal logo
2. Stacked logo
3. Icon-only logo
4. Dark-background logo
5. Monochrome black logo
6. Monochrome white logo
7. PWA application icon
8. Favicon

### 5.4 Logo Usage

Recommended clear space:

```text
At least 25% of the logo symbol width on all sides
```

Do not:

* Stretch or distort the logo
* Rotate the logo
* Add heavy shadows
* Place the full-color logo on visually noisy backgrounds
* Recolor individual parts inconsistently
* Apply unapproved gradients
* Use the wordmark without proper spacing

---

## 6. Color System

### 6.1 Brand Colors

```css
--brand-primary: #2563ff;
--brand-primary-hover: #1d4ed8;
--brand-primary-active: #1e40af;

--brand-cyan: #22d3ee;
--brand-indigo: #3b5bff;
--brand-violet: #7c4dff;
```

### 6.2 Background and Surface Colors

```css
--background: #f7f9fc;
--surface: #ffffff;
--surface-secondary: #f8fafc;
--surface-tertiary: #f1f5f9;
--surface-hover: #f4f7fb;
```

### 6.3 Text Colors

```css
--text-primary: #0f172a;
--text-secondary: #64748b;
--text-muted: #94a3b8;
--text-inverse: #ffffff;
```

### 6.4 Border Colors

```css
--border-default: #e2e8f0;
--border-subtle: #edf2f7;
--border-strong: #cbd5e1;
--focus-ring: rgba(37, 99, 255, 0.24);
```

### 6.5 Semantic Colors

```css
--success: #16a34a;
--success-background: #ecfdf3;

--warning: #f59e0b;
--warning-background: #fffbeb;

--danger: #ef4444;
--danger-background: #fef2f2;

--info: #2563eb;
--info-background: #eff6ff;
```

### 6.6 Balance Colors

Use colors carefully when displaying customer balances.

```css
--balance-outstanding: #ef4444;
--balance-paid: #16a34a;
--balance-neutral: #64748b;
```

Recommended usage:

* Outstanding customer balance: red
* Fully paid account: green
* No activity or unavailable value: neutral gray
* Payment amount: green
* Credit purchase amount: blue or indigo

Color must not be the only indicator. Include labels, icons, or signs such as `+` and `−`.

---

## 7. Gradient System

Gradients should mainly be used for:

* Logo
* Primary branding areas
* PWA install card
* Sign-in illustration
* Offline illustration
* Small accent elements

Recommended brand gradient:

```css
background: linear-gradient(
  135deg,
  #22d3ee 0%,
  #2563ff 50%,
  #7c4dff 100%
);
```

Recommended dark branded background:

```css
background: linear-gradient(
  145deg,
  #07152f 0%,
  #0b1f4f 50%,
  #172554 100%
);
```

Avoid placing gradients behind dense tables or long forms.

---

## 8. Typography

### 8.1 Recommended Font Stack

```css
font-family:
  Inter,
  Geist,
  "SF Pro Display",
  "SF Pro Text",
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Recommended primary font:

```text
Inter or Geist
```

### 8.2 Type Scale

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 2rem;      /* 32px */
```

### 8.3 Heading Styles

```css
.heading-1 {
  font-size: 2rem;
  line-height: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.heading-2 {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.heading-3 {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 650;
}
```

### 8.4 Body Styles

```css
.body-large {
  font-size: 1rem;
  line-height: 1.625rem;
  font-weight: 400;
}

.body {
  font-size: 0.875rem;
  line-height: 1.375rem;
  font-weight: 400;
}

.label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
}

.caption {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}
```

### 8.5 Numeric Values

Balances, totals, prices, and metrics should use tabular numbers when available.

```css
font-variant-numeric: tabular-nums;
```

Example:

```text
₱28,640.75
```

---

## 9. Spacing System

Use an 8-point spacing system.

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

Recommended layout spacing:

* Page padding desktop: `24px–32px`
* Page padding tablet: `20px–24px`
* Page padding mobile: `16px`
* Card padding desktop: `20px–24px`
* Card padding mobile: `16px`
* Form field gap: `16px`
* Section gap: `24px–32px`
* Table row height: `64px–76px`

---

## 10. Border Radius

```css
--radius-sm: 0.5rem;    /* 8px */
--radius-md: 0.75rem;   /* 12px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.25rem;   /* 20px */
--radius-full: 9999px;
```

Recommended usage:

* Inputs: `10px–12px`
* Buttons: `10px–12px`
* Cards: `16px`
* Drawers and modals: `16px–20px`
* Tags and badges: fully rounded

---

## 11. Shadow System

Shadows must be subtle.

```css
--shadow-sm:
  0 1px 2px rgba(15, 23, 42, 0.04),
  0 1px 3px rgba(15, 23, 42, 0.06);

--shadow-md:
  0 8px 24px rgba(15, 23, 42, 0.06);

--shadow-lg:
  0 20px 45px rgba(15, 23, 42, 0.1);
```

Recommended usage:

* Default cards: border with little or no shadow
* Hovered cards: `shadow-sm`
* Dropdowns: `shadow-md`
* Modals and drawers: `shadow-lg`

Avoid strong shadows around every container.

---

## 12. Layout System

### 12.1 Desktop

Desktop uses:

* Fixed or sticky left sidebar
* Sticky top navigation bar
* Main content canvas
* Optional right-side contextual panel
* Multi-column card layouts
* Responsive tables

Recommended structure:

```text
┌──────────────┬────────────────────────────────────┐
│ Sidebar      │ Top Navigation                     │
│              ├────────────────────────────────────┤
│              │ Main Content                       │
│              │                                    │
└──────────────┴────────────────────────────────────┘
```

Recommended sidebar width:

```text
240px–260px
```

Recommended maximum content width:

```text
1440px–1600px
```

### 12.2 Tablet

Tablet may use:

* Collapsible sidebar
* Drawer navigation
* Reduced card columns
* Stacked side panels
* Horizontally scrollable tables when necessary

### 12.3 Mobile

Mobile uses:

* Compact top application bar
* Bottom navigation
* Single-column cards
* Full-width controls
* Stacked forms
* Sticky primary action
* Card-based replacements for dense tables

Recommended bottom navigation items:

1. Overview
2. Products
3. Customers
4. Ledger
5. More

---

## 13. Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Mobile

```text
Below 768px
```

Behavior:

* Bottom navigation replaces sidebar
* Tables become cards or simplified rows
* Forms use one column
* Primary actions may become sticky
* Nonessential columns are hidden
* Drawers become full-screen sheets

### Tablet

```text
768px–1023px
```

Behavior:

* Sidebar collapses
* Dashboard cards use two columns
* Contextual side panels move below main content
* Tables retain only important columns

### Desktop

```text
1024px and above
```

Behavior:

* Full sidebar
* Multi-column layouts
* Tables display complete information
* Side panels may remain visible

---

## 14. Navigation

### 14.1 Desktop Sidebar

Primary navigation:

* Overview
* Products
* Price History
* Customers
* Ledger
* Record Purchase
* Record Payment
* Offline

The sidebar may also include:

* Current connection status
* Store name
* Store identifier
* Administrator plan
* Store settings shortcut
* PWA installation prompt

### 14.2 Active Navigation State

The active item should use:

* Light blue background
* Blue icon
* Blue label
* Optional left indicator
* Medium font weight

Example:

```css
background: #eff6ff;
color: #2563eb;
```

### 14.3 Mobile Navigation

Use a bottom navigation bar with the most frequently accessed pages.

Less common destinations should appear under `More`.

The bottom navigation should:

* Remain visible on key pages
* Respect device safe areas
* Use clear labels
* Avoid more than five visible destinations

---

## 15. Top Navigation Bar

The top bar may contain:

* Global search
* Notifications
* Connection state
* Administrator avatar
* Administrator name
* Role
* Account menu

Desktop global search placeholder:

```text
Search customers, products...
```

Keyboard shortcut may be shown:

```text
⌘ K
```

or:

```text
Ctrl K
```

The top bar should remain visually light and should not compete with page content.

---

## 16. Component Patterns

## 16.1 Buttons

### Primary Button

Use for the most important action.

```css
background: #2563ff;
color: #ffffff;
```

Examples:

* Add Product
* Save Customer
* Record Credit Purchase
* Record Payment
* Try Again

### Secondary Button

Use for alternative actions.

```css
background: #ffffff;
color: #0f172a;
border: 1px solid #e2e8f0;
```

### Tertiary Button

Use for low-priority actions.

```css
background: transparent;
color: #2563eb;
```

### Danger Button

Use for destructive confirmation only.

```css
background: #ef4444;
color: #ffffff;
```

Button heights:

```text
Small: 36px
Default: 44px
Large: 48px–52px
```

---

## 16.2 Cards

Cards should:

* Group related information
* Use a white or subtle tinted background
* Have a clear heading
* Avoid unnecessary nested cards
* Maintain consistent padding
* Use subtle borders

Base card:

```css
background: #ffffff;
border: 1px solid #e2e8f0;
border-radius: 16px;
padding: 24px;
```

---

## 16.3 Metric Cards

Metric cards display:

* Icon
* Label
* Main value
* Optional trend
* Optional drill-down action

Examples:

* Active Products
* Customers with Unpaid Balances
* Total Outstanding Amount
* Recently Updated Products
* Highest Outstanding Balance

Metric cards should use tinted accents rather than full saturated backgrounds.

---

## 16.4 Tables

Desktop tables should include:

* Clear headers
* Comfortable row height
* Search and filtering
* Sortable fields where useful
* Row actions
* Pagination
* Empty state
* Loading state

Avoid showing unnecessary data.

### Products Table

Recommended columns:

* Product
* Cost Price
* Selling Price
* Markup
* Last Updated
* Actions

### Customers Table

Recommended columns:

* Customer
* Contact Number
* Address
* Current Balance
* Last Transaction
* Actions

### Ledger Table

Recommended columns:

* Date and Time
* Description
* Type
* Amount
* Running Balance
* Recorded By

On mobile, tables should transform into stacked transaction or entity cards.

---

## 16.5 Form Fields

Each field should include:

* Persistent label
* Clear placeholder
* Optional helper text
* Validation message
* Required indicator when applicable

Recommended input height:

```text
44px–48px
```

Field states:

* Default
* Hover
* Focus
* Filled
* Disabled
* Error
* Success

Focus state:

```css
border-color: #2563ff;
box-shadow: 0 0 0 4px rgba(37, 99, 255, 0.12);
```

Do not rely on placeholder text as the only label.

---

## 16.6 Selectors

Customer and product selectors should support:

* Search
* Keyboard navigation
* Recent selections
* Clear selection
* Empty state
* Loading state

Product search may support:

* Product name
* SKU
* Barcode

Customer search may support:

* Full name
* Contact number

---

## 16.7 Badges

Recommended badge types:

* Active
* Fully Paid
* Unpaid
* Purchase
* Payment
* Adjustment
* Cash
* Other Method
* Offline
* Online

Badges should use both text and color.

---

## 16.8 Drawers and Sheets

Desktop forms may open in a right-side drawer.

Examples:

* Add Product
* Edit Product
* Add Customer
* Edit Customer
* Filters

Mobile forms should open as full-screen or near-full-screen sheets.

Recommended drawer width:

```text
380px–460px
```

---

## 16.9 Modals

Use modals for:

* Delete confirmation
* Destructive changes
* Final transaction confirmation
* Critical warnings

Avoid using modals for long forms.

---

## 16.10 Toast Notifications

Use toast notifications for lightweight feedback.

Examples:

```text
Product added successfully.
Customer details updated.
Payment recorded successfully.
Purchase added to customer balance.
Connection restored.
```

Error messages should clearly explain the issue and next action.

---

## 17. Page Specifications

## 17.1 Admin Sign-In

### Purpose

Allow approved administrators to access Vendara securely.

### Desktop Layout

Use a split-screen composition.

Left side:

* Vendara logo
* Short product description
* Key system benefits
* Sari-sari store illustration
* Secure private access message

Right side:

* Sign-in card
* Email address field
* Password field
* Remember me option
* Forgot password action
* Sign In button
* Email verification link action
* Approved-administrators-only notice

### Mobile Layout

Use:

* Centered logo
* Compact sign-in card
* Minimal decorative background
* Full-width fields and buttons
* Security message below the form

### States

* Default sign-in
* Invalid credentials
* Email verification required
* Verification link sent
* Loading
* Temporary server error
* Offline

---

## 17.2 Overview

### Purpose

Provide a concise summary of the store’s administrative state.

### Main Sections

1. Greeting and current date
2. Summary metrics
3. Recent activity
4. Quick actions
5. Customer balance snapshot
6. PWA installation prompt

### Core Metrics

* Active Products
* Customers with Unpaid Balances
* Total Outstanding Amount

### Quick Actions

* Add Product
* Record Purchase
* Record Payment
* View Customers

### Recent Activity

Examples:

* Payment recorded
* Credit purchase recorded
* Customer added
* Product price updated

### Customer Balance Snapshot

May include:

* Customers with no balance
* Customers with balances aged 1–7 days
* Customers with balances aged 8–30 days
* Customers with balances over 30 days
* Highest outstanding balances

Charts should remain simple and administrative.

---

## 17.3 Products

### Purpose

Manage products and their cost and selling prices.

### Main Sections

1. Page title and description
2. Product search
3. Filters
4. Add Product action
5. Product summary metrics
6. Product table or mobile cards
7. Pagination
8. Add or edit product drawer

### Product Fields

* Product name
* SKU
* Barcode
* Category
* Cost price
* Selling price
* Notes

Do not include inventory quantity unless the project scope changes.

### Product Metrics

Optional metrics:

* Total Products
* Recently Updated
* Highest Markup
* Low Markup Alert

### Markup Calculation

```text
Markup Percentage =
((Selling Price - Cost Price) / Cost Price) × 100
```

Display a markup preview while entering prices.

### Product Actions

* View price history
* Edit product
* Delete product

Deletion must require confirmation.

---

## 17.4 Product Price History

### Purpose

Track historical changes to a product’s cost and selling prices.

### Main Sections

1. Product summary
2. Current pricing
3. Audit summary
4. Price trend chart
5. Historical changes table

### Product Summary

Display:

* Product image or icon
* Product name
* SKU
* Category
* Current cost price
* Current selling price
* Current markup
* Status
* Last updated date

### Audit Summary

Display:

* Total price changes
* Most recent update
* Average markup
* Updated by

### History Table

Recommended columns:

* Date and Time
* Previous Cost
* New Cost
* Previous Selling Price
* New Selling Price
* Changed By
* Notes

Use arrows and labels to clarify increases and decreases.

---

## 17.5 Customers

### Purpose

Manage customer accounts and monitor current balances.

### Main Sections

1. Search
2. Filters
3. Add Customer action
4. Customer summary metrics
5. Customer table or cards
6. Customer actions
7. Pagination
8. Add or edit customer drawer

### Customer Fields

* Full name
* Contact number
* Address or barangay
* Notes
* Optional opening balance

### Customer Metrics

* Total Customers
* Customers with Unpaid Balances
* Fully Paid Customers
* Highest Outstanding Balance

### Customer Actions

* View ledger
* Record credit purchase
* Record payment
* Edit customer
* More actions

Balance values must be prominent and easy to scan.

---

## 17.6 Customer Ledger

### Purpose

Show the customer’s complete financial history and current balance.

### Customer Header

Display:

* Customer initials or avatar
* Full name
* Active status
* Contact number
* Address
* Customer since date
* Current balance
* Record Purchase action
* Record Payment action

### Summary Metrics

* Total Purchases
* Total Payments
* Current Balance
* Last Activity

### Transaction Filters

Allow filtering by:

* All Transactions
* Purchases
* Payments
* Adjustments
* Date range

### Transaction Table

Display:

* Date and time
* Description
* Transaction type
* Amount
* Running balance
* Recorded by

### Balance Chart

A simple line chart may show the balance over time.

The chart must support the table, not replace it.

### Balance Explanation

Include a clear note:

```text
A positive balance means the customer still owes the store.
```

---

## 17.7 Record Credit Purchase

### Purpose

Record products purchased on credit and increase the selected customer’s outstanding balance.

### Main Sections

1. Customer selector
2. Current outstanding balance
3. Product list
4. Quantity controls
5. Optional line discount
6. Purchase summary
7. Optional notes
8. Confirmation action

### Product Line Fields

Each product line should show:

* Product name
* Product image or icon
* SKU
* Selling price
* Quantity
* Optional discount
* Line total
* Remove action

### Purchase Summary

Display:

* Subtotal
* Discount total
* Total
* Total items
* Previous outstanding balance
* New outstanding balance

### Primary Action

```text
Record Credit Purchase
```

Before saving, the user should clearly see how much will be added to the customer’s balance.

### Validation

Prevent submission when:

* No customer is selected
* No products are added
* Quantity is zero
* Product price is invalid
* Total is not greater than zero

---

## 17.8 Record Payment

### Purpose

Record a customer payment and reduce the selected customer’s outstanding balance.

### Main Sections

1. Customer selector
2. Current balance
3. Payment amount
4. Payment date and time
5. Payment method
6. Reference or notes
7. Payment summary
8. Recent payments
9. Confirmation action

### Payment Methods

Recommended options:

* Cash
* GCash
* Bank Transfer
* Other

The design may group non-cash methods under:

```text
Other Internal Method
```

### Payment Summary

Display:

* Previous balance
* Payment amount
* New balance after payment

Example:

```text
Previous Balance: ₱1,250.00
Payment Amount: −₱500.00
New Balance: ₱750.00
```

### Validation

Prevent submission when:

* No customer is selected
* Payment amount is zero
* Payment amount is negative
* Payment amount exceeds the current balance without explicit support
* Required date or payment method is missing

### Primary Action

```text
Record Payment
```

---

## 17.9 Offline Screen

### Purpose

Inform the administrator that Vendara cannot access live store data.

### Message

Recommended heading:

```text
You’re offline
```

Recommended description:

```text
We can’t reach your store data right now. Vendara will reconnect automatically when your internet connection returns.
```

### Actions

* Try Again
* Go to Last Available View
* View Offline Tips

### PWA Message

```text
Some recently viewed information may still be available while offline.
```

### Mobile Design

The mobile offline screen may use:

* Dark branded background
* Large offline illustration
* High-contrast buttons
* Connection-restored notification
* Safe-area padding

### Offline Restrictions

Do not allow transactions to appear successfully saved unless the application intentionally supports reliable offline transaction queues.

When offline transaction recording is unsupported, disable transaction actions and explain why.

---

## 18. Empty States

Every list must include a useful empty state.

### No Products

```text
No products yet

Add your first product to start managing store prices.
```

Primary action:

```text
Add Product
```

### No Customers

```text
No customers yet

Create a customer account before recording credit purchases.
```

Primary action:

```text
Add Customer
```

### No Transactions

```text
No transactions found

Purchases and payments recorded for this customer will appear here.
```

### No Search Results

```text
No matching results

Try another name, phone number, SKU, or filter.
```

---

## 19. Loading States

Use skeleton loading for:

* Metric cards
* Product rows
* Customer rows
* Ledger transactions
* Summary panels

Use button loading states for submissions.

Example:

```text
Recording payment...
```

Do not allow duplicate submissions while loading.

---

## 20. Success States

After important actions, show clear confirmation.

Examples:

```text
Product added successfully.
```

```text
Customer account created.
```

```text
Credit purchase recorded. ₱147.00 was added to the customer’s balance.
```

```text
Payment recorded. The customer’s new balance is ₱750.00.
```

For financial actions, success messages should include the resulting amount or balance when possible.

---

## 21. Error Handling

Error messages should:

* Explain what failed
* Avoid technical jargon
* Suggest the next action
* Preserve entered form data
* Avoid clearing the form after failure

Example:

```text
The payment could not be recorded. Check your connection and try again.
```

Validation errors should appear close to the relevant field.

---

## 22. Confirmation Patterns

Require confirmation for:

* Deleting products
* Deleting customers
* Recording unusually large transactions
* Reversing transactions
* Editing sensitive historical data

Example deletion confirmation:

```text
Delete this product?

The product will be removed from the active product list. Existing transaction records will remain available.
```

Actions:

* Cancel
* Delete Product

---

## 23. Accessibility

Vendara should meet WCAG 2.1 AA where practical.

Requirements:

* Minimum body text size of 14px
* Sufficient color contrast
* Visible keyboard focus states
* Semantic labels for all form fields
* Keyboard-accessible navigation
* Accessible modal focus management
* Descriptive button labels
* Icons paired with accessible text
* Error messages connected to fields
* Charts supported by text summaries
* Status not communicated through color alone
* Reduced-motion support

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 24. PWA Requirements

Vendara should support:

* Installation on compatible devices
* Application manifest
* PWA icons
* Theme color
* Standalone display
* Cached application shell
* Offline detection
* Reconnection feedback
* Responsive layouts
* Safe-area support
* Touch-friendly interaction
* Fast initial loading

Recommended manifest values:

```json
{
  "name": "Vendara",
  "short_name": "Vendara",
  "description": "Private sari-sari store administration system.",
  "display": "standalone",
  "background_color": "#f7f9fc",
  "theme_color": "#2563ff",
  "orientation": "portrait-primary"
}
```

Recommended icon sizes:

```text
16 × 16
32 × 32
48 × 48
72 × 72
96 × 96
128 × 128
144 × 144
152 × 152
180 × 180
192 × 192
384 × 384
512 × 512
```

Include maskable icons where supported.

---

## 25. Safe-Area Support

Mobile layouts should respect device safe areas.

```css
padding-top: env(safe-area-inset-top);
padding-right: env(safe-area-inset-right);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
```

Sticky bottom actions must not overlap the mobile navigation or device home indicator.

---

## 26. Motion

Motion should be subtle and functional.

Recommended durations:

```css
--duration-fast: 120ms;
--duration-default: 180ms;
--duration-slow: 240ms;
```

Recommended easing:

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

Appropriate motion:

* Drawer entering from the side
* Modal fading and scaling slightly
* Button press feedback
* Skeleton loading
* Toast entering and leaving
* Balance number updating smoothly

Avoid:

* Large bouncing elements
* Constant background animation
* Excessive parallax
* Slow transitions
* Decorative motion inside transaction forms

---

## 27. Icons

Use one consistent icon library.

Recommended options:

* Lucide
* Phosphor
* Heroicons

Recommended icon style:

* Rounded
* Simple
* 1.75px–2px stroke
* Consistent optical size

Common icons:

* Overview: home
* Products: package or shopping basket
* Price History: clock or chart
* Customers: users
* Ledger: receipt or notebook
* Record Purchase: shopping cart
* Record Payment: wallet
* Offline: cloud-off or wifi-off
* Add: plus
* Edit: pencil
* Delete: trash
* Search: magnifying glass
* Filter: funnel

---

## 28. Currency Formatting

Use Philippine peso formatting consistently.

Examples:

```text
₱0.00
₱500.00
₱1,250.00
₱28,640.75
```

Recommended formatter:

```ts
const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});
```

Negative payment display:

```text
−₱500.00
```

Do not use inconsistent formats such as:

```text
P500
PHP 500.00
₱ 500
```

unless required by a specific export format.

---

## 29. Date and Time Formatting

Recommended date format:

```text
May 20, 2026
```

Recommended time format:

```text
9:45 AM
```

Combined format:

```text
May 20, 2026 · 9:45 AM
```

Mobile compact format:

```text
May 20 · 9:45 AM
```

Always preserve the original transaction timestamp in the database.

---

## 30. Suggested Component Structure

```text
src/
├── components/
│   ├── branding/
│   │   ├── VendaraLogo.tsx
│   │   ├── VendaraIcon.tsx
│   │   └── AppIcon.tsx
│   ├── layout/
│   │   ├── AdminShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── BottomNavigation.tsx
│   │   └── PageContainer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   ├── Dialog.tsx
│   │   ├── Sheet.tsx
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   └── Skeleton.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   └── PriceHistoryChart.tsx
│   ├── customers/
│   │   ├── CustomerCard.tsx
│   │   ├── CustomerTable.tsx
│   │   ├── CustomerForm.tsx
│   │   └── CustomerSummary.tsx
│   └── transactions/
│       ├── TransactionTable.tsx
│       ├── TransactionCard.tsx
│       ├── CreditPurchaseForm.tsx
│       ├── PaymentForm.tsx
│       └── BalanceSummary.tsx
```

---

## 31. Suggested Routes

```text
/sign-in
/verify-email
/overview
/products
/products/new
/products/:productId
/products/:productId/edit
/products/:productId/price-history
/customers
/customers/new
/customers/:customerId
/customers/:customerId/edit
/customers/:customerId/ledger
/transactions/credit-purchase
/transactions/payment
/offline
/settings
```

---

## 32. Design Tokens Example

```css
:root {
  --color-brand-primary: #2563ff;
  --color-brand-cyan: #22d3ee;
  --color-brand-indigo: #3b5bff;
  --color-brand-violet: #7c4dff;

  --color-background: #f7f9fc;
  --color-surface: #ffffff;
  --color-surface-secondary: #f8fafc;

  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  --color-border: #e2e8f0;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #2563eb;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-sm:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 1px 3px rgba(15, 23, 42, 0.06);

  --shadow-md:
    0 8px 24px rgba(15, 23, 42, 0.06);

  --font-sans:
    Inter,
    Geist,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}
```

---

## 33. UX Copy Guidelines

Vendara copy should be:

* Clear
* Friendly
* Direct
* Specific
* Calm
* Nontechnical

Preferred:

```text
Record Payment
```

Avoid:

```text
Submit Transaction Data
```

Preferred:

```text
No customers found.
```

Avoid:

```text
The query returned zero customer entities.
```

Preferred:

```text
Check your internet connection and try again.
```

Avoid:

```text
Network request failed.
```

---

## 34. Security and Privacy Messaging

Because Vendara is private, the interface should reinforce that access is restricted.

Recommended sign-in message:

```text
This system is for approved store administrators only.
```

Recommended security message:

```text
Your store records are private and protected.
```

Do not make unsupported claims such as:

* Completely hack-proof
* Military-grade security
* 100% secure
* Impossible to breach

Use accurate language based on the implemented security controls.

---

## 35. Final Design Checklist

Before considering a Vendara screen complete, confirm that:

* The page has one clear primary action
* Important balances are visible
* Currency is formatted consistently
* Desktop, tablet, and mobile layouts work
* Touch targets are at least 44px
* Forms have persistent labels
* Loading, empty, error, and success states exist
* Destructive actions require confirmation
* Text contrast is accessible
* Keyboard focus is visible
* Mobile safe areas are respected
* Navigation remains consistent
* The interface does not introduce inventory features
* The interface does not resemble a public storefront
* The interface remains appropriate for private administration
* Charts provide useful information
* Offline behavior is explained honestly
* Financial actions show the resulting balance before confirmation

---

## 36. Closing Direction

Vendara should feel like a focused administrative workspace built specifically for a sari-sari store owner.

The design should combine the clarity of professional financial software with the friendliness and simplicity of a modern mobile application.

The final implementation should prioritize:

1. Fast transaction recording
2. Clear customer balances
3. Simple product price management
4. Reliable transaction history
5. Strong responsive behavior
6. Accessible interaction
7. Clear online and offline states

The interface should always help the administrator answer three questions quickly:

```text
Who owes the store?
How much do they owe?
What transaction happened?
```
