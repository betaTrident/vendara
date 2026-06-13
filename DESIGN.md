# Design System Specification: The Industrial Atelier (Vendara Edition)

## 1. Overview & Creative North Star
**Creative North Star: "Precision Engineering"**
This design system moves away from the "software-as-a-service" template look and adopts the aesthetic of a high-end industrial blueprint. It is defined by a "Structured Canvas" approach—where the interface is treated like a physical workstation. By combining a crisp, light-theme base with the high-octane energy of **Racing Orange (#FF5722)**, we create an environment that feels authoritative, enterprise-grade, and hyper-efficient. 

The system utilizes intentional asymmetry and a rigid "Structured Canvas" layout. Instead of floating elements, the UI is anchored by a logic of 1px architectural lines and subtle tonal shifts, mimicking the precision of technical drafts and professional instrumentation.

This specification is customized for Vendara, focusing on a **light-only top-bar navigation layout** suitable for product pricelists, credit ledgers, and transaction timelines.

---

## 2. Colors: The High-Contrast Palette
The color logic is built on "Industrial Neutrality." We use high-contrast blacks and crisp whites, punctuated by the "Racing Orange" for critical path actions.

### Primary & Accent
- **Primary (#b02f00):** Used for emphasized states.
- **Primary Container (#FF5722):** The signature "Racing Orange." Use this for hero CTAs and primary action states.
- **On-Primary (#ffffff):** The mandatory contrast for all orange backgrounds.

### The "Structured Canvas" Surfaces
- **Surface (#f3f3f3):** The base canvas.
- **Surface Card (#ffffff):** Used for elevated "active" workspaces or cards.
- **Surface Low (#f3f3f3):** Used for low-priority grouping or subtle background grouping.
- **Surface High (#e8e8e8):** Used for structural headers, table headers, or "well" components.

### Signature Gradients
For high-impact areas, use a linear gradient from `primary` (#b02f00) to `primary-container` (#FF5722) at a 135-degree angle. This adds a "machined metal" depth to the Racing Orange that a flat hex code cannot achieve.

---

## 3. Typography: Editorial Authority
We use **Inter** exclusively for general text and headings, leveraging its variable font weight to create a hierarchy that feels like a technical manual. We use monospaced fonts (like **Geist Mono** or **JetBrains Mono**) for monetary numbers and tables.

- **Display (Lg/Md/Sm):** 3.5rem down to 2.25rem. Set with -0.02em letter spacing and "SemiBold" weight. These are your "Statement" moments.
- **Headline (Lg/Md/Sm):** 2rem to 1.5rem. Use these for major section starts. 
- **Title (Lg/Md/Sm):** 1.375rem to 1rem. Medium weight. These anchor the "Structured Canvas" blocks.
- **Body (Lg/Md/Sm):** 1rem down to 0.75rem. Regular weight. Ensure a line height of 1.5 for maximum legibility in data-heavy enterprise views.
- **Label (Md/Sm):** 0.75rem to 0.6875rem. Bold weight, All-Caps. Used for technical metadata and table headers (via `.ia-label` class) to reinforce the industrial aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Up" does not mean "Shadow." "Up" means "Brighter."

- **The Layering Principle:** Stacking follows a light-source logic. The card surfaces (`#ffffff`) sit on top of the base canvas (`#f9f9f9`) to create a natural lift.
- **The "Ghost Border" (The 1px Rule):** To satisfy the "Structured Canvas" aesthetic, use the outline variant (`#d1d1d1`) for 1px internal lines. This provides a "technical drawing" feel.
- **Glassmorphism:** The top navigation header uses `bg-ia-surface-card/85` at 85% opacity with a `backdrop-blur-md` and a 1px border. This keeps the user grounded in the "Industrial Atelier" while providing modern depth.

### Border Radius System
To improve display quality without making the interface feel "soft," apply a controlled radius scale everywhere.

- **Global Rule:** Keep radii between **2px and 8px** only.
- **Default Radius:** `4px` (`0.25rem`) for most interactive controls (buttons, inputs, selects, tabs).
- **Maximum Radius:** `8px` for large containers (cards, panels) and overlays.

#### Radius Tokens
- `radius-sm`: 4px
- `radius-md`: 6px
- `radius-lg`: 8px

---

## 5. Components: Industrial Primitives

### Buttons
- **Primary:** Background `primary-container` (#FF5722), text `on-primary`. 4px corner radius. No shadow.
- **Secondary:** 1px `outline` border, text `primary`.
- **Tertiary:** Text-only, SemiBold, All-Caps `label-md` styling.

### Cards & Canvas Blocks
- **The Layout:** Forbid divider lines within cards. Separate content using `ia-well` headers and card bodies.
- **Radius:** Use **MD (6px)** or **LG (8px)** for section cards. Use **SM (4px)** for compact inner cards. Avoid `xl` or `full` except for status chips.

### Input Fields
- **Default State:** 1px outline border. Background `ia-surface`.
- **Focus State:** 2px border using `ia-primary-container` (#FF5722). No "outer glow" or "halo." Precision is key.

### Data Grids (The "Enterprise" Specialist)
- **Headers:** `bg-ia-surface-high` background, `ia-label` (All-Caps) typography.
- **Row Separation:** Strictly use a 1px border separator (`border-ia-outline-variant`). No alternating "zebra" stripes.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Racing Orange" Sparingly:** It is a high-vis color. Use it for hero actions, active states, and critical triggers only.
- **Embrace White Space:** Enterprise-grade does not mean "crammed." Use layout gutters to create breathing room between sections.
- **Align to the Grid:** Every element must feel like it was snapped into place by a machine.

### Don’t:
- **Don't Use Rounded Corners over 8px:** High-end industrial design favors the "soft-square" over the "pill" shape. Large radii feel too consumer-soft.
- **Don't Use Dividers for Spacing:** If you need to separate two pieces of text, use vertical margins rather than border lines. Lines are for structural containers only.