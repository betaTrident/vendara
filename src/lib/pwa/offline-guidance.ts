import { UNSUPPORTED_PWA_CLAIM_PATTERNS } from "@/lib/marketing/landing-content";

export const OFFLINE_PAGE_COPY = {
  heading: "You're offline",
  body: "We can't reach your store data right now. Vendara will reconnect automatically when the internet returns.",
  pwaNote:
    "This is a PWA. Recently opened admin views may still be available from your device cache, but live product, customer, and ledger data needs a connection.",
  reconnectNote: "We'll let you know when you're back online.",
  tryAgain: "Try again",
  lastView: "Go to last available view",
  tips: "Offline tips",
} as const;

export type OfflineTip = {
  title: string;
  body: string;
};

export const OFFLINE_TIPS: readonly OfflineTip[] = [
  {
    title: "What still opens",
    body: "The installed app shell and this offline page can open without a connection. A page you already visited may show cached layout, but numbers can be stale.",
  },
  {
    title: "What needs internet",
    body: "Signing in, loading products and customers, recording purchases or payments, and refreshing balances all require a live connection so the store record stays accurate.",
  },
  {
    title: "While you wait",
    body: "Use Try again after your connection returns. If you recently opened a safe admin page, Go to last available view may reopen that cached screen until fresh data loads.",
  },
  {
    title: "Purchases and payments need internet",
    body: "Vendara requires a live connection before purchases or payments are saved. Nothing is stored until the server confirms the entry.",
  },
] as const;

export const findUnsupportedOfflineClaims = (
  copy: readonly string[],
): string[] => {
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
