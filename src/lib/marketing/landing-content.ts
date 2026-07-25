export type LandingNavItem = {
  label: string;
  href: string;
};

export type LandingFeature = {
  number: string;
  title: string;
  body: string;
};

export type LandingScreen = {
  key: string;
  title: string;
  body: string;
  alt: string;
};

export type LandingFaq = {
  question: string;
  answer: string;
};

export const LANDING_META = {
  title: "Vendara — Private store administration, made simpler",
  description:
    "Vendara is a private workspace for approved sari-sari store administrators to manage products, prices, customer credit accounts, payments, and ledgers.",
  canonicalPath: "/",
  ogType: "website",
  ogImagePath: "/brand/vendara-app-icon-512.png",
} as const;

export const LANDING_HERO = {
  eyebrow: "Private workspace for sari-sari store teams",
  headlinePrimary: "Private store administration,",
  headlineAccent: "made simpler.",
  supporting:
    "Vendara gives approved store administrators one calm place to manage products and prices, customer credit accounts, purchases, payments, and the ledger behind every balance.",
  primaryCta: "Request access",
  secondaryCta: "View screens",
} as const;

export const LANDING_CTAS = {
  adminSignIn: "/admin",
  viewScreens: "#product",
  features: "#features",
  howItWorks: "#how-it-works",
  pwa: "#pwa",
  faq: "#faq",
} as const;

export const LANDING_NAV: readonly LandingNavItem[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Screens", href: "#product" },
  { label: "PWA", href: "#pwa" },
  { label: "FAQ", href: "#faq" },
] as const;

export const LANDING_FEATURES: readonly LandingFeature[] = [
  {
    number: "01",
    title: "Products & pricing",
    body: "Keep products current, change a price with context, and keep the history behind every update.",
  },
  {
    number: "02",
    title: "Customer accounts",
    body: "Give regular customers a clear account record instead of relying on memory or loose paper notes.",
  },
  {
    number: "03",
    title: "Credit purchases",
    body: "Record what was taken on credit as it happens, with the right products and date attached.",
  },
  {
    number: "04",
    title: "Payments & balances",
    body: "Post payments and review a running balance with a complete, traceable transaction history.",
  },
  {
    number: "05",
    title: "Customer ledger",
    body: "Open an account to see purchases, payments, voids, and the balance that explains them.",
  },
  {
    number: "06",
    title: "Installable workspace",
    body: "Use Vendara in the browser or install it on a compatible phone, tablet, or shared store device.",
  },
] as const;

export const LANDING_STEPS = [
  {
    index: "1",
    title: "Set up products and customer accounts",
    body: "Start with the things you sell and the customers whose balances you need to follow.",
  },
  {
    index: "2",
    title: "Record credit purchases and payments",
    body: "Add the transaction while it is fresh, rather than reconstructing it from notes later.",
  },
  {
    index: "3",
    title: "Check the ledger with confidence",
    body: "Open a customer account to see the running balance and the entries that explain it.",
  },
] as const;

export const LANDING_SCREENS: readonly LandingScreen[] = [
  {
    key: "overview",
    title: "Overview",
    body: "A practical at-a-glance view of the store workspace.",
    alt: "Vendara overview workspace",
  },
  {
    key: "customers",
    title: "Customers",
    body: "Find customer accounts and see balances before you record the next transaction.",
    alt: "Vendara customers workspace",
  },
  {
    key: "ledger",
    title: "Ledger",
    body: "Review every purchase, payment, and running balance in one record.",
    alt: "Vendara customer ledger workspace",
  },
] as const;

export const LANDING_ASSURANCES = [
  {
    title: "Approved access",
    body: "Use the Admin sign in page once the account owner has approved your email.",
  },
  {
    title: "Record-first workflow",
    body: "Products, credit purchases, payments, and their history stay tied to the store workspace.",
  },
  {
    title: "Connection-aware",
    body: "The PWA has an offline fallback so you understand when a live connection is needed.",
  },
] as const;

export const LANDING_FAQS: readonly LandingFaq[] = [
  {
    question: "Who can use Vendara?",
    answer:
      "Vendara is intended for store owners and the administrators they approve. It is not a public customer-facing store.",
  },
  {
    question: "Does Vendara work offline?",
    answer:
      "The installed app and its offline page continue to open when a connection drops. Product, customer, and ledger updates need an internet connection so the store record remains accurate.",
  },
  {
    question: "How do I get access?",
    answer:
      "Ask the owner or person who manages your store's Vendara account to approve your administrator email. Once approved, use the Admin sign in page.",
  },
  {
    question: "Can I use it on my phone?",
    answer:
      "Yes. Vendara is responsive in the browser and can be installed from a compatible browser's app menu.",
  },
] as const;

export const LANDING_PWA = {
  title: "Available where you work.",
  body: "Use Vendara in your browser, or install it from a compatible browser so the workspace is one tap away on a shared store device.",
  statusTitle: "Install Vendara",
  statusDefault:
    "Your browser will show an install option when it is available. Financial updates still require a live connection.",
} as const;

/** Patterns that over-claim PWA/offline capability beyond the verified contract. */
export const UNSUPPORTED_PWA_CLAIM_PATTERNS: readonly RegExp[] = [
  /sync(?:ing|s)?\s+automatically/i,
  /auto[-\s]?sync/i,
  /offline\s+transaction/i,
  /queue(?:d|s)?\s+(?:writes?|transactions?|purchases?|payments?).{0,40}offline/i,
  /offline.{0,40}queue(?:d|s)?\s+(?:writes?|transactions?)/i,
  /works?\s+fully\s+offline/i,
];

export const collectLandingCopy = (): string[] => [
  LANDING_META.title,
  LANDING_META.description,
  LANDING_HERO.eyebrow,
  LANDING_HERO.headlinePrimary,
  LANDING_HERO.headlineAccent,
  LANDING_HERO.supporting,
  ...LANDING_FEATURES.flatMap((feature) => [feature.title, feature.body]),
  ...LANDING_STEPS.flatMap((step) => [step.title, step.body]),
  ...LANDING_SCREENS.flatMap((screen) => [screen.title, screen.body]),
  ...LANDING_ASSURANCES.flatMap((item) => [item.title, item.body]),
  ...LANDING_FAQS.flatMap((faq) => [faq.question, faq.answer]),
  LANDING_PWA.title,
  LANDING_PWA.body,
  LANDING_PWA.statusTitle,
  LANDING_PWA.statusDefault,
];

export const findUnsupportedPwaClaims = (copy: readonly string[]): string[] => {
  const hits: string[] = [];
  for (const text of copy) {
    for (const pattern of UNSUPPORTED_PWA_CLAIM_PATTERNS) {
      if (pattern.test(text)) {
        hits.push(text);
        break;
      }
    }
  }
  return hits;
};

export const buildLandingJsonLd = (siteOrigin: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vendara",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: LANDING_META.description,
  url: new URL(LANDING_META.canonicalPath, siteOrigin).toString(),
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/LimitedAvailability",
    price: "0",
    priceCurrency: "PHP",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Approved store administrators",
  },
});
