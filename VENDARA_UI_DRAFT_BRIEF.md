  # Vendara UI Drafting Brief

  ## 1. Assignment

  Create high-fidelity, responsive UI drafts for **Vendara**, an owner-only web application and installable PWA used by a sari-sari store owner or approved store administrator.

  Design the application as a compact, polished operational workspace for:

  - Maintaining a product price list
  - Recording cost and selling prices
  - Reviewing product price changes
  - Maintaining customer credit accounts
  - Recording purchases made on credit, locally called “utang”
  - Recording customer payments
  - Reviewing running balances and transaction history
  - Correcting mistakes by voiding ledger entries
  - Viewing a concise business summary

  The application should be practical for frequent use on a phone, tablet, or desktop.

  Do not design Vendara as:

  - An ecommerce store
  - A public product catalog
  - A marketplace
  - A booking or reservation application
  - A POS checkout interface
  - A stock or inventory tracking application
  - A customer-facing account portal
  - An accounting suite
  - A payment gateway
  - A marketing website

  There are no public shoppers, customer logins, carts, orders, bookings, stock quantities, warehouses, categories, product images, checkout flows, or payment-gateway screens in the current product.

  ---

  ## 2. Product Summary

  ### Product name

  **Vendara**

  ### One-sentence description

  Vendara helps a sari-sari store owner maintain product prices and customer credit ledgers in one secure workspace.

  ### Longer product description

  Vendara is a private administrative PWA for small-store operations. Its primary jobs are:

  1. Keep an accurate list of products and their current cost and selling prices.
  2. Automatically retain price-change history whenever a product’s price is updated.
  3. Maintain customer accounts and their outstanding balances.
  4. Record credit purchases containing one or more products.
  5. Record payments against a customer’s account.
  6. Calculate and show the customer’s running balance.
  7. Preserve corrections through voiding instead of silently deleting financial history.
  8. Provide a concise dashboard showing product, customer, and outstanding-debt totals.

  ### Product personality

  Vendara should feel:

  - Calm
  - Trustworthy
  - Efficient
  - Friendly
  - Financially responsible
  - Easy to scan
  - Appropriate for a small business
  - Modern without looking like a generic corporate analytics dashboard
  - Premium but not luxurious or decorative
  - Comfortable for non-technical users

  ### Local context

  The application is intended for Philippine store operations.

  Use:

  - Philippine peso formatting: `₱1,250.00`
  - Familiar, plain language
  - “Credit purchase” as the formal UI label
  - “Utang” as optional supporting helper text, such as “Record a credit purchase (utang).”
  - Example customer names such as “Aling Nena”
  - Example products such as “Century Tuna 150g,” “Lucky Me Pancit Canton,” or “Bear Brand 33g”

  The application language is currently English, with `en-PH` locale context.

  ---

  ## 3. Users and Permissions

  ### Primary user

  The primary user is a sari-sari store owner.

  Typical characteristics:

  - Manages the business personally
  - Frequently works from a mobile phone
  - Needs quick access during store hours
  - May be interrupted while entering information
  - Values readable balances and obvious confirmation states
  - May not be highly technical
  - Needs protection against duplicate transactions and accidental destructive actions

  ### Secondary user

  An approved store administrator or staff member.

  The current product does not implement multiple permission levels. Approved administrators use the same operational workspace.

  ### Access model

  Vendara is admin-only.

  - Users sign in with an approved admin email and password.
  - An admin email may need verification before access is granted.
  - Email verification can use a one-time verification code.
  - Unauthenticated users only see the sign-in experience.
  - Authenticated users see the operational console.
  - The application should show a clear sign-out action.
  - Do not design sign-up, public registration, social login, customer login, or role-management screens.

  ---

  ## 4. Current Route Structure

  The implementation currently has only three user-facing routes:

  | Route | Purpose | UI direction |
  |---|---|---|
  | `/` | Redirects to the admin application | No landing page; immediately redirect to `/admin` |
  | `/admin` | Authenticated admin workspace or sign-in screen | Main application |
  | `/offline` | PWA offline fallback | Dedicated connection-loss screen |

  The current application implements most functionality inside `/admin` as tabs and panels rather than separate URLs.

  For UI drafting, treat the major workflows as distinct screens or clearly distinct states even if the eventual implementation retains a single route.

  Do not create:

  - A marketing homepage
  - An About page
  - A public price-list route
  - A customer-facing catalog
  - Public customer profiles
  - A separate customer login route

  ---

  ## 5. Recommended Information Architecture

  The MVP has three core first-class destinations:

  1. **Overview**
  2. **Products**
  3. **Customers**

  Supporting views are reached contextually:

  - Product price history is opened from a product.
  - Customer ledger is opened from a customer.
  - Credit-purchase and payment forms are opened from a customer ledger.
  - Settings are limited to connection status, application updates, and signing out.

  ### Recommended desktop navigation

  Use a compact persistent left sidebar if designing a future multi-page version:

  - Vendara logo and name
  - Overview
  - Products
  - Customers
  - Bottom area:
    - Online/offline status
    - Signed-in admin indicator
    - Sign out

  Because the current MVP has only two operational areas besides the overview, a restrained sticky top bar plus three-section navigation is also valid.

  If using a sidebar:

  - Width: approximately 232–256 px
  - Keep it visually light
  - Do not fill it with placeholder items
  - Do not add Reports, Billing, Team, Integrations, Notifications, or Help sections unless they are clearly marked as deferred and visually excluded from the MVP drafts

  ### Recommended mobile navigation

  Use one of these approaches:

  - A bottom navigation bar with Overview, Products, and Customers; or
  - A compact top bar with a menu drawer

  Bottom navigation is preferable for frequent one-handed use.

  Do not place sign out in the primary bottom navigation. Put it in an account or overflow menu.

  ---

  ## 6. Core Domain Model

  ### Product

  Each product has:

  | Field | Type or format | UI notes |
  |---|---|---|
  | Product name | Required text, maximum 150 characters | Example: “Century Tuna 150g” |
  | Cost price | Required currency, zero or greater | Amount paid by the store |
  | Selling price | Required currency, zero or greater | Amount charged to customers |
  | Note | Optional text, maximum 255 characters | Supplier, expiry, pack-size, or storage note |
  | Active state | Internal/currently active | The current UI primarily lists active records |
  | Created date | System-generated | Secondary metadata |
  | Updated date | System-generated | Useful in details/history |

  Derived product values:

  - Markup amount = selling price − cost price
  - Markup percentage = markup amount ÷ cost price × 100
  - If cost price is zero, avoid showing an invalid percentage

  Product operations:

  - Search/filter products by name
  - Add a product
  - Edit a product
  - Delete or deactivate a product
  - Open price history
  - Use a product when recording a credit purchase

  The application does not track:

  - Stock quantity
  - Reorder levels
  - Suppliers as entities
  - Product categories
  - Product images
  - Barcodes
  - SKUs
  - Variants
  - Inventory movements

  Do not add those fields to the drafts.

  ### Price-history record

  A price-history record contains:

  | Field | UI presentation |
  |---|---|
  | Product | Product whose prices changed |
  | Previous cost price | Currency |
  | New cost price | Currency |
  | Previous selling price | Currency |
  | New selling price | Currency |
  | Changed at | Date and time |
  | Direction | Increase, decrease, or no selling-price change |

  Price history is generated when cost or selling prices change. It is informational and should not have an “Add history” action.

  ### Customer

  Each customer has:

  | Field | Type or format | UI notes |
  |---|---|---|
  | Customer name | Required text, maximum 150 characters | Example: “Aling Nena” |
  | Note | Optional text, maximum 255 characters | Contact details, address, or recognition note |
  | Outstanding balance | Computed currency | Not directly editable |
  | Active state | Internal/currently active | Current UI focuses on active accounts |
  | Created date | System-generated | Secondary metadata |
  | Updated date | System-generated | Secondary metadata |

  Customer operations:

  - Search customers by name
  - Add a customer
  - Edit customer details
  - Delete/deactivate an eligible customer
  - Select a customer
  - Open their ledger
  - Record a credit purchase
  - Record a payment
  - Review their balance and history

  Do not add separate address, phone, email, birthday, or identity fields. The current MVP stores any additional contact or address information in the optional note.

  ### Ledger entry

  A ledger entry is either:

  - A **debt/credit purchase**
  - A **payment**

  Shared fields:

  | Field | Notes |
  |---|---|
  | Entry date | Required date |
  | Note | Optional, maximum 255 characters |
  | Running balance | Computed after the transaction |
  | Created date/time | System metadata |
  | Void status | Active or voided |
  | Void information | Who voided it, when, and why |

  #### Credit-purchase entry

  A credit purchase contains one or more line items.

  Each line item contains:

  - Product
  - Product-name snapshot
  - Unit cost-price snapshot
  - Unit selling-price snapshot
  - Quantity
  - Line total

  The charged amount is based on the selling-price snapshot.

  Form fields:

  - Entry date
  - Repeating product rows
  - Product selector
  - Quantity, positive whole number
  - Unit selling price shown as contextual information
  - Calculated line total
  - Add another item
  - Remove item
  - Optional note
  - Calculated purchase total
  - Submit action: “Record credit purchase”

  At least one valid product is required.

  #### Payment entry

  Form fields:

  - Entry date
  - Payment amount, greater than zero
  - Optional payment memo
  - Submit action: “Record payment”

  The memo may contain information such as a GCash reference, cash receipt note, or other payment detail. Vendara does not process the payment—it only records it.

  #### Voiding an entry

  Existing ledger entries are not silently edited or deleted in the current integrity model.

  To correct a ledger mistake:

  - Select “Void entry”
  - Require a correction reason
  - Reason must be between 3 and 500 characters
  - Show a confirmation warning
  - Preserve the original record
  - Mark it as voided
  - Remove its balance impact
  - Display who voided it, when, and why
  - Allow users to show or hide voided transactions

  The UI should make it very difficult to confuse voiding with deletion.

  ---

  ## 7. Dashboard / Overview Screen

  ### Purpose

  Give the store owner a fast summary and direct entry points into daily work.

  ### Required content

  Header:

  - Page title: “Overview” or “Vendara”
  - Supporting copy: “Products, customers, and credit ledgers in one place.”
  - Small “Owner” or “Admin” badge
  - Online/offline status
  - Sign-out access

  Summary cards:

  1. **Active products**
    - Product count
    - Supporting label: “in your price list”
  2. **Customers with balance**
    - Number of customers who owe money
    - Supporting text showing settled and total customer counts
  3. **Total outstanding**
    - Total amount owed across customer accounts
    - Philippine peso formatting
    - “Across customer accounts” when greater than zero
    - “All accounts settled” when zero

  ### Recommended shortcuts

  The drafts may include shortcut actions without introducing new domain functionality:

  - Add product
  - Add customer
  - Record credit purchase
  - Record payment
  - View products
  - View customers

  If “Record credit purchase” or “Record payment” is used from the overview, it must first require customer selection.

  ### Dashboard states

  Loading:

  - Skeleton versions of all summary cards
  - Skeleton for main workspace content
  - Avoid indeterminate full-screen spinners

  Error:

  - Inline error banner: “Unable to load overview.”
  - Retry action
  - Products and customers should remain accessible if possible

  Empty/new-account state:

  - Product count: 0
  - Customer count: 0
  - Total outstanding: ₱0.00
  - Show a friendly onboarding sequence:
    1. Add a product
    2. Add a customer
    3. Record a credit purchase when needed

  Do not show charts with fake data. The existing MVP does not provide time-series reporting endpoints.

  ---

  ## 8. Products Screen

  ### Purpose

  Maintain the store’s current price list and inspect price changes.

  ### Desktop layout

  Recommended structure:

  - Page or section header:
    - “Products”
    - Product count
    - Search input
    - Primary action: “Add product”
  - Main table
  - Product form in a dialog, drawer, or right-side panel
  - Price history in a separate drawer or detail panel

  Product table columns:

  - Product
  - Cost
  - Selling price
  - Markup
  - Actions

  Possible secondary product content:

  - Product note beneath or beside the name
  - Updated date where space permits

  Row actions:

  - Edit
  - Price history
  - Delete/deactivate

  Do not rely only on unlabeled icons. Use accessible tooltips or an overflow menu.

  ### Product form

  Title should change according to state:

  - “Add product”
  - “Edit product”

  Fields:

  1. Product name
  2. Cost price, prefixed with `₱`
  3. Selling price, prefixed with `₱`
  4. Optional note

  Calculated preview:

  - Markup amount
  - Markup percentage

  Actions:

  - Cancel
  - Save product or Update product

  Validation:

  - Product name is required
  - Cost price must be zero or greater
  - Selling price must be zero or greater
  - Note cannot exceed 255 characters

  Form states:

  - Default
  - Focus
  - Invalid
  - Saving
  - Saved/success
  - API failure
  - Dirty/unsaved

  ### Product empty states

  No products:

  - Heading: “No products yet”
  - Copy: “Add your first item to start building the store price list.”
  - CTA: “Add product”

  No search results:

  - “No products match ‘{search term}’.”
  - Action: “Clear search”

  ### Mobile products layout

  Do not compress the full five-column table into a narrow viewport.

  Use product cards:

  - Product name
  - Selling price as the most prominent amount
  - Cost and markup as secondary values
  - Note if present
  - Overflow actions
  - Price-history action

  Keep search and “Add product” readily available. A sticky bottom action may be used if it does not obscure content.

  ---

  ## 9. Price History Screen or Drawer

  ### Purpose

  Show an audit trail of product price changes.

  ### Entry point

  Open from the relevant product’s row or card using:

  - “Price history”
  - A history icon with accessible label

  ### Header

  - “Price history”
  - Product name
  - Current cost and selling prices
  - Close/back action

  ### Timeline content

  Each change should show:

  - Change date and time
  - Cost: old value → new value
  - Selling: old value → new value
  - Increase/decrease indicator
  - Use arrows and text, not color alone

  Example:

  - Selling price increased
  - `₱28.00 → ₱30.00`
  - Cost price: `₱23.00 → ₱24.50`
  - `24 Jul 2026, 3:42 PM`

  ### Empty state

  “No price changes recorded. Changes will appear here when the product’s cost or selling price is updated.”

  ### Responsive behavior

  - Desktop: right-side drawer or adjacent detail panel
  - Tablet: drawer
  - Mobile: full-height sheet or dedicated sub-screen
  - Preserve the originating product-list scroll position when closed

  ---

  ## 10. Customers Screen

  ### Purpose

  Find a customer quickly, understand account status, and open their ledger.

  ### Desktop layout

  Use a master-detail layout:

  - Left panel: searchable customer list
  - Right panel: selected customer’s account and ledger

  Suggested proportions:

  - Customer list: approximately 320–380 px
  - Ledger detail: remaining width

  Customer-list controls:

  - Search customers
  - Add customer
  - Count of matching and total customers

  Customer row or card:

  - Initials/avatar placeholder derived from the customer’s name
  - Customer name
  - Optional note excerpt
  - Outstanding balance
  - Status:
    - “Outstanding” when balance is greater than zero
    - “Settled” when balance is zero
  - Edit action
  - Delete/deactivate action

  Use positive/settled and outstanding states clearly, but do not use color alone.

  ### Customer form

  Fields:

  - Customer name
  - Optional note

  Example note placeholder:

  “Contact details, address, or recognition notes”

  Actions:

  - Cancel
  - Save customer or Update customer

  Validation:

  - Customer name is required
  - Note cannot exceed 255 characters

  ### Customers empty states

  No customers:

  - Heading: “No customer accounts yet”
  - Copy: “Add a customer to start tracking credit purchases and payments.”
  - CTA: “Add customer”

  No search result:

  - “No customers match ‘{search term}’.”
  - Clear-search action

  No selected customer on desktop:

  - “Select a customer”
  - “Choose an account to review its balance and transaction history.”

  ### Mobile customer behavior

  Use a two-step navigation flow:

  1. Customer list
  2. Customer ledger detail

  When a customer is selected, transition to a full-width detail screen with a visible back action.

  Do not show the narrow master list and detail pane side-by-side on a phone.

  ---

  ## 11. Customer Ledger Detail Screen

  ### Purpose

  Provide a complete, trustworthy view of one customer’s credit account.

  ### Header

  Include:

  - Back to customers, especially on mobile
  - Customer name
  - Optional note
  - Edit customer action
  - Current outstanding balance
  - Account state: Outstanding or Settled

  ### Summary metrics

  Show:

  - Current balance
  - Total credit purchases
  - Total payments

  Amounts should use tabular numerals.

  ### Primary actions

  - Record credit purchase
  - Record payment

  “Record credit purchase” should be the visually primary action when the account workflow emphasizes sales on credit.

  The two actions must remain visually distinct:

  - Credit purchase increases the balance
  - Payment reduces the balance

  ### Ledger history

  Desktop table columns:

  - Date
  - Type
  - Details
  - Amount or balance impact
  - Running balance
  - Actions

  The current implementation uses date, type, details, balance, and actions. The redesigned draft may separate transaction amount from running balance if that improves comprehension, but it must not invent additional data.

  Credit-purchase entry:

  - Type label: “Credit purchase”
  - Products, unit prices, and quantities
  - Total amount
  - Optional note
  - Running balance after entry

  Payment entry:

  - Type label: “Payment”
  - Payment amount
  - Optional memo
  - Running balance after entry

  Voided entry:

  - Visually subdued
  - “Voided” badge
  - Original details retained
  - No balance impact
  - Void reason
  - Who and when
  - Do not remove it from the history permanently

  Controls:

  - Toggle: “Show voided entries”
  - Action: “Void entry” on eligible active entries

  ### Ledger empty state

  “No transactions recorded for this account yet.”

  Provide contextual actions:

  - Record first credit purchase
  - Record payment only if recording an opening or external balance payment is valid in the product logic; otherwise prioritize the first credit purchase

  ### Mobile ledger history

  Use stacked transaction cards or a readable vertical timeline.

  Each card should show:

  - Date
  - Type badge
  - Amount
  - Product/item summary or payment memo
  - Running balance
  - Overflow menu for voiding

  Avoid horizontal scrolling for normal use.

  ---

  ## 12. Record Credit Purchase Flow

  ### Purpose

  Add products purchased on credit to the selected customer’s ledger.

  ### Recommended presentation

  - Desktop: modal, right drawer, or expandable panel
  - Mobile: full-screen sheet

  ### Header

  - “Record credit purchase”
  - Customer name
  - Supporting text: “Add the items purchased on credit.”

  ### Fields

  1. Entry date
  2. One or more product rows
  3. Optional note

  Each product row includes:

  - Product selector
  - Current selling price
  - Quantity
  - Line total
  - Remove-row action

  Additional controls:

  - “Add another item”
  - Calculated grand total

  ### Example row

  - Century Tuna 150g
  - ₱30.00 each
  - Quantity: 2
  - Line total: ₱60.00

  ### Validation and safeguards

  - Require at least one product
  - Require a positive whole-number quantity
  - Disable submission if offline
  - Disable repeated submission while saving
  - Preserve entered values on recoverable API errors
  - Use an idempotency key internally to prevent duplicate financial entries
  - Do not expose technical idempotency language in the UI

  ### Confirmation

  After success:

  - Close the form or show a success state
  - Refresh balance and ledger
  - Show a toast such as:
    - “Credit purchase recorded”
    - “₱120.00 added to Aling Nena’s balance”

  ### Error example

  “Unable to record this purchase. Your entries have been kept. Check your connection and try again.”

  ---

  ## 13. Record Payment Flow

  ### Purpose

  Record money received from the selected customer.

  Vendara records the payment but does not process money electronically.

  ### Presentation

  - Desktop: compact dialog, drawer, or expandable panel
  - Mobile: full-screen sheet

  ### Header

  - “Record payment”
  - Customer name
  - Current outstanding balance

  ### Fields

  1. Entry date
  2. Payment amount
  3. Optional memo

  Memo placeholder:

  “GCash reference, cash receipt, or other details”

  ### Helpful contextual content

  - Current balance: `₱450.00`
  - Payment amount: `₱200.00`
  - Expected remaining balance: `₱250.00`

  Only show expected balance if computed deterministically from current data.

  ### Validation

  - Payment amount must be greater than zero
  - Clearly decide how overpayments are handled based on backend behavior
  - Do not silently cap or alter the entered amount
  - Disable repeated submission while saving
  - Preserve values after recoverable errors

  ### Success

  Toast example:

  “Payment recorded. Aling Nena’s remaining balance is ₱250.00.”

  ---

  ## 14. Void Transaction Flow

  ### Purpose

  Correct an incorrect financial entry without destroying the audit trail.

  ### Interaction

  From a ledger entry’s action menu, select “Void entry.”

  Show a confirmation dialog containing:

  - Transaction date
  - Transaction type
  - Amount
  - Customer
  - Explanation that the original record will remain visible
  - Required correction-reason textarea
  - Cancel
  - Destructive action: “Void entry”

  Suggested warning copy:

  “Voiding removes this transaction’s effect from the customer’s balance. The original entry and correction reason will remain in the ledger history.”

  The destructive action should remain disabled until a valid reason of at least three characters is entered.

  Do not use:

  - “Delete transaction”
  - An unconfirmed trash icon
  - A reversible-looking toggle
  - A simple browser confirm box in the final design

  ---

  ## 15. Authentication Screens

  ### Session-checking state

  Before displaying sign-in or the app:

  - Show the Vendara top bar or brand mark
  - Use lightweight skeletons
  - Avoid briefly flashing protected content

  ### Sign-in screen

  Required content:

  - Vendara logo
  - Heading: “Sign in to Vendara”
  - Supporting copy: “Restricted to approved store administrators.”
  - Admin email
  - Password
  - Primary action: “Access console”
  - Loading label: “Signing in…”

  Feedback states:

  - Invalid credentials
  - Network error
  - Email not verified
  - Successful email verification
  - Session expired

  Do not add:

  - Public sign-up
  - Social sign-in
  - Customer sign-in
  - “Start free trial”
  - Pricing plans

  ### Email-verification flow

  Required content:

  - Explanation that the email must be verified
  - Action: “Request verification code” or “Send verification email”
  - Verification-code input
  - Primary action: “Verify and sign in”
  - Loading state: “Verifying…”
  - Ability to return to sign-in

  The existing application accepts a one-time email verification code.

  Make the OTP input easy to use on mobile:

  - Numeric keyboard
  - One-time-code autocomplete
  - Clear focus
  - Error text attached to the field

  ### Sign out

  Sign out should be accessible from the app chrome or account menu.

  After signing out:

  - Return to the sign-in screen
  - Do not retain private account data in the visible UI

  ---

  ## 16. Offline and PWA States

  Vendara is installable as a PWA, but private store data and API operations require an internet connection.

  ### Online indicator

  Show a compact connection-status indicator:

  - Green dot + “Online”
  - Warning/error icon or dot + “Offline”
  - Do not communicate status through color alone

  ### Offline while already inside the application

  Show a persistent banner:

  “Offline — store data and saves need an internet connection.”

  While offline:

  - Prevent or disable server-dependent actions
  - Explain why buttons are disabled
  - Do not imply that unsaved financial changes will sync later
  - Existing visible content may remain on screen, but it should be clear that it may not be current

  ### Dedicated offline page

  Required content:

  - Heading: “You are offline”
  - Explanation:
    “Vendara can stay open, but products, customers, and ledger data need an internet connection. Nothing was saved while offline.”
  - Primary action: “Try again”

  ### Application-update prompt

  When a new PWA version is available:

  - Message: “A new version is ready.”
  - Actions:
    - Later
    - Update

  If a form contains unsaved changes, warn before reloading for the update.

  ---

  ## 17. Loading, Empty, Error, and Success States

  Every page and major panel must include drafts for these states.

  ### Loading

  Use:

  - Skeleton stat cards
  - Skeleton table rows
  - Skeleton customer-list items
  - Skeleton ledger entries
  - Disabled submit controls with specific loading text

  Avoid using one full-screen spinner for all actions.

  ### Empty

  Every empty state should explain:

  1. What is absent
  2. Why the area matters
  3. What the user can do next

  ### Errors

  Use:

  - Field-level errors for validation
  - Form-level banner for submission failures
  - Page-level banner for loading failures
  - A retry action when appropriate
  - Human-readable messages
  - Preservation of user input after recoverable failures

  Do not expose:

  - SQL errors
  - Stack traces
  - Request internals
  - Authentication tokens
  - Database names

  ### Success

  Use brief toast notifications for:

  - Product added
  - Product updated
  - Product removed/deactivated
  - Customer added
  - Customer updated
  - Customer removed/deactivated
  - Credit purchase recorded
  - Payment recorded
  - Ledger entry voided
  - Verification email sent

  Financial success messages should include the relevant customer and amount where helpful.

  ---

  ## 18. Visual Direction

  Create a clean, white, approachable admin interface inspired by the restraint and clarity of premium consumer applications, but do not copy Airbnb or any other brand.

  ### Overall aesthetic

  - White primary surfaces
  - Very light neutral page background
  - Near-black primary text
  - Medium-gray secondary text
  - Thin neutral dividers
  - Restrained shadows
  - Generous but practical spacing
  - Soft rounded corners
  - Clear typography
  - Limited accent-color use
  - Strong information hierarchy
  - Few decorative elements
  - No gradients unless extremely subtle and functional

  ### Recommended accent direction

  The current implementation uses a bright coral/rose accent similar to `#FF385C`.

  For a production identity, use a distinct Vendara coral-red such as:

  - Primary: `#E83F5B` or a similar accessible coral-red
  - Primary hover: a darker shade around `#CF304B`
  - Primary soft surface: a very pale rose
  - Focus ring: primary at approximately 25–35% opacity

  Do not overuse the accent. Reserve it for:

  - Primary actions
  - Active navigation
  - Focus states
  - Selected items
  - Small brand details

  Outstanding debt should not automatically use the same styling as destructive errors. Financial debt is important information, not necessarily a system error.

  ### Semantic colors

  - Success/settled/payment: accessible green
  - Warning/offline: amber
  - Destructive/void/delete: dark red
  - Information: blue where needed
  - Neutral/status: gray

  Use an icon or text label alongside semantic color.

  ### Typography

  Use an open-source typeface:

  - Primary: Inter
  - Alternative: Geist

  Recommended hierarchy:

  - Page title: 28–32 px desktop, 24–28 px mobile
  - Section title: 20–24 px
  - Card title: 16–18 px
  - Body: 14–16 px
  - Metadata: 12–13 px
  - Button/label: 13–15 px

  Use tabular numerals for money and balances.

  Use a monospace font only for:

  - Currency tables where alignment materially helps
  - Verification codes
  - Technical references

  Do not use monospace for every dashboard label.

  ### Spacing

  Use a 4 px base:

  - 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px

  Typical layout:

  - Mobile gutter: 16 px
  - Tablet gutter: 24 px
  - Desktop gutter: 24–32 px
  - Card padding: 16–24 px
  - Section gap: 24–32 px

  ### Radius

  Suggested radii:

  - Inputs/buttons: 8–10 px
  - Cards: 12–16 px
  - Dialogs/drawers: 16–20 px
  - Status chips: fully rounded where appropriate

  Avoid both excessively sharp industrial corners and oversized playful radii.

  ### Shadows

  - Cards should usually rely on borders rather than shadows
  - Use a subtle shadow on hoverable cards only
  - Use a stronger, soft shadow for dialogs and drawers
  - Avoid stacked bezels, double borders, or heavy elevation

  ---

  ## 19. Component Requirements

  Create a reusable component system containing:

  ### Application chrome

  - Vendara logo
  - Desktop sidebar or top bar
  - Mobile top bar
  - Mobile bottom navigation or menu drawer
  - Online/offline status
  - Admin/account menu
  - Sign-out action
  - PWA update prompt

  ### Navigation

  - Default
  - Hover
  - Active
  - Keyboard focus
  - Disabled, if applicable
  - Collapsed-sidebar variant
  - Mobile variant

  ### Summary card

  Variants:

  - Standard count
  - Currency total
  - Settled/success
  - Attention/outstanding
  - Loading skeleton
  - Error

  ### Section header

  Supports:

  - Title
  - Description
  - Count
  - Search
  - Filter if genuinely needed
  - Primary action
  - Secondary action

  ### Data table

  Supports:

  - Sortable-looking headers only where sorting is implemented
  - Responsive column priority
  - Row hover
  - Keyboard focus
  - Row actions
  - Empty result
  - Loading rows
  - Loading failure
  - Sticky header on long lists

  Do not include fake filters or sorting controls that the product does not support.

  ### Forms

  Components:

  - Text input
  - Currency input
  - Quantity input
  - Date input
  - Search input
  - Product selector
  - Textarea
  - Field label
  - Helper text
  - Field error
  - Required indicator
  - Form-level error
  - Save/cancel action group

  ### Buttons

  Variants:

  - Primary
  - Secondary
  - Tertiary/ghost
  - Destructive
  - Icon button
  - Loading
  - Disabled

  Minimum touch target: approximately 44 × 44 px for mobile-critical controls.

  ### Status elements

  - Settled
  - Outstanding
  - Payment
  - Credit purchase
  - Voided
  - Online
  - Offline
  - Owner/admin

  ### Overlays

  - Product form dialog/drawer
  - Customer form dialog/drawer
  - Price-history drawer
  - Credit-purchase sheet
  - Payment sheet
  - Void-confirmation dialog
  - Mobile navigation drawer

  ### Feedback

  - Toast
  - Inline error banner
  - Offline banner
  - Success banner
  - Empty-state panel
  - Skeleton
  - Unsaved-changes warning
  - Application-update prompt

  ---

  ## 20. Responsive Requirements

  ### Desktop: 1200 px and above

  - Maximum content width around 1280–1440 px
  - Persistent navigation may be used
  - Summary cards in one row
  - Products use a full table
  - Customers use master-detail layout
  - Ledger uses a detailed table
  - Forms may use right-side drawers or centered dialogs

  ### Tablet: approximately 768–1199 px

  - Sidebar may collapse to icons or become a drawer
  - Summary cards may remain in three columns at the wider end or become a two-plus-one grid
  - Product table hides lower-priority content
  - Customer list and detail may remain split only if each pane stays readable
  - Forms use wider drawers or responsive dialogs

  ### Mobile: below approximately 768 px

  - Single-column layout
  - Bottom navigation or menu drawer
  - Summary cards stack or use a compact two-column arrangement
  - Product table becomes product cards
  - Customer master-detail becomes separate list and detail screens
  - Ledger table becomes transaction cards/timeline
  - Credit-purchase and payment forms become full-height sheets
  - Form fields stack vertically
  - Action buttons may become sticky at the bottom
  - Account for safe-area insets
  - Avoid persistent horizontal scrolling
  - Maintain at least 44 px touch targets
  - Keep critical balance and submit information visible

  ---

  ## 21. Accessibility Requirements

  The drafts must visibly support implementation of:

  - WCAG AA text contrast
  - Visible keyboard-focus states
  - A skip-to-content link
  - Semantic page headings
  - Properly associated labels and inputs
  - Error text connected to fields
  - `aria-live` behavior for asynchronous feedback
  - Screen-reader-friendly dialog titles and descriptions
  - Focus trapping and focus restoration for dialogs
  - Escape-to-close where safe
  - Keyboard-operable tables, menus, drawers, and tabs
  - Non-color-only status communication
  - Clear destructive-action confirmation
  - At least 44 × 44 px mobile touch targets
  - Reduced-motion support
  - No essential information available only on hover
  - Currency values readable by assistive technology
  - Loading states announced without repeatedly interrupting the user

  ---

  ## 22. Security and Trust Cues

  The interface should feel private and reliable without using excessive shield imagery.

  Include trust cues where appropriate:

  - “Restricted to approved store administrators”
  - Visible signed-in/admin state
  - Clear sign-out action
  - Clear session-expired message
  - Confirmation before destructive actions
  - Preserved audit trail for voided ledger entries
  - No display of secrets or backend details
  - No claims that offline changes will sync later

  Financial operations should feel deliberate:

  - Confirm the selected customer
  - Show transaction total before submission
  - Prevent duplicate submission
  - Show success only after the server confirms the operation
  - Preserve input when submission fails
  - Update the displayed balance immediately after confirmed success

  ---

  ## 23. Suggested Screen Set for UI Drafts

  Produce responsive drafts for the following screens and states.

  ### Authentication

  1. Sign in
  2. Sign in — invalid credentials
  3. Sign in — verification required
  4. Verification-code entry
  5. Verification success
  6. Session-checking skeleton

  ### Overview

  7. Overview — populated
  8. Overview — new/empty workspace
  9. Overview — loading
  10. Overview — summary error
  11. Overview — offline banner

  ### Products

  12. Product list — populated desktop
  13. Product list — mobile cards
  14. Product list — empty
  15. Product search — no results
  16. Add product form
  17. Edit product form with markup preview
  18. Product form — validation errors
  19. Price-history drawer — populated
  20. Price-history drawer — empty
  21. Product deletion/deactivation confirmation

  ### Customers

  22. Customer master-detail — desktop
  23. Customer list — mobile
  24. Customer list — empty
  25. Customer search — no results
  26. Add customer form
  27. Edit customer form
  28. No-customer-selected state

  ### Ledger

  29. Customer ledger — populated desktop
  30. Customer ledger — mobile transaction timeline/cards
  31. Customer ledger — empty
  32. Record credit purchase — one line item
  33. Record credit purchase — multiple line items
  34. Credit-purchase form — validation error
  35. Record payment
  36. Payment form — validation error
  37. Void-entry confirmation
  38. Ledger with voided entries visible

  ### PWA and system states

  39. Dedicated offline page
  40. New-version update prompt
  41. Update prompt with unsaved-changes warning
  42. Generic recoverable API error
  43. Success-toast examples

  ---

  ## 24. Sample Data for the Drafts

  ### Summary

  - Active products: 48
  - Total customers: 27
  - Customers with balance: 9
  - Settled customers: 18
  - Total outstanding: ₱4,785.50

  ### Products

  | Product | Cost | Selling | Markup |
  |---|---:|---:|---:|
  | Century Tuna 150g | ₱25.50 | ₱30.00 | ₱4.50 / 17.6% |
  | Lucky Me Pancit Canton | ₱12.00 | ₱15.00 | ₱3.00 / 25.0% |
  | Bear Brand 33g | ₱10.50 | ₱13.00 | ₱2.50 / 23.8% |
  | Coca-Cola Mismo | ₱16.00 | ₱20.00 | ₱4.00 / 25.0% |
  | Safeguard Bar 55g | ₱18.75 | ₱22.00 | ₱3.25 / 17.3% |

  ### Customers

  | Customer | Note | Balance |
  |---|---|---:|
  | Aling Nena | Blue gate beside the chapel | ₱450.00 |
  | Mang Jun | Tricycle driver, morning route | ₱185.50 |
  | Ate Liza | House behind the barangay hall | ₱0.00 |
  | Carlo Reyes | GCash payments | ₱1,120.00 |

  ### Ledger for Aling Nena

  1. 24 Jul 2026 — Credit purchase — 2 × Century Tuna, 1 × Bear Brand — +₱73.00 — Balance ₱450.00
  2. 22 Jul 2026 — Payment — Cash — −₱200.00 — Balance ₱377.00
  3. 20 Jul 2026 — Credit purchase — household items — +₱125.00 — Balance ₱577.00
  4. 18 Jul 2026 — Voided credit purchase — wrong customer selected — no balance impact

  ---

  ## 25. Explicit Scope Boundaries

  Do not include these in the UI drafts:

  - Public storefront
  - Public product search
  - Customer-facing catalog
  - Customer accounts or customer login
  - Shopping cart
  - Checkout
  - Digital payment processing
  - Order management
  - Stock levels
  - Inventory movement
  - Low-stock alerts
  - Suppliers as managed entities
  - Product categories
  - Product photography
  - Barcodes
  - Purchase orders
  - Sales receipts
  - Tax calculations
  - Employee management
  - Permission matrices
  - Multi-store switching
  - Advanced analytics
  - Revenue charts
  - Profit-and-loss reporting
  - Marketing tools
  - Notifications center
  - Subscription billing

  If a non-MVP idea is shown for presentation completeness, clearly label it “Deferred” and do not include it in the primary navigation or core screen drafts.

  ---

  ## 26. Deliverable Instructions

  Produce:

  1. A concise sitemap
  2. A desktop application shell
  3. A mobile application shell
  4. High-fidelity drafts for all core screens
  5. Loading, empty, error, success, offline, and destructive-confirmation states
  6. A component inventory
  7. A small design-token sheet
  8. Desktop and mobile variants for products, customers, and ledgers
  9. Interaction notes for drawers, dialogs, forms, transaction submission, and voiding
  10. Accessibility annotations for focus, validation, dialogs, and status communication

  Keep the result implementation-aware and grounded in the exact Vendara MVP. Do not turn the product into a generic SaaS dashboard or ecommerce application.

  ---

  ## 27. Current Implementation References

  The brief above is grounded in these project files:

  - Product summary and technical setup: `README.md`
  - Current admin workspace: `src/components/app/AdminConsole.tsx`
  - Product workflows: `src/components/app/ProductManager.tsx`
  - Customer workflows: `src/components/app/CustomerManager.tsx`
  - Ledger, purchase, payment, and voiding workflows: `src/components/app/CustomerLedgerPanel.tsx`
  - Authentication and email verification: `src/components/app/AdminLogin.tsx`
  - Current domain types: `src/lib/types.ts`
  - Input constraints: `src/lib/validation.ts`
  - Database model: `db/schema.sql`
  - Current visual tokens: `src/styles/global.css`
  - Existing detailed redesign direction: `UI-REDESIGN-PLAN.md`
  - Long-form product implementation plan: `VENDARA_ADMIN_ONLY_PWA_PLAN.md`

  One implementation detail the UI designer should not copy blindly: the current base layout still loads old `Outfit` and `Geist Mono` Google fonts and contains an old `ia-*` skip-link class, while the active global stylesheet has already moved toward Inter and softer `vn-*` styling. The drafts should use the cleaner Vendara direction described above rather than preserving those leftover Industrial Atelier conventions.
