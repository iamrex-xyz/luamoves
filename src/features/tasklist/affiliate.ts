// Affiliate detection for the "Regel dit voor mij" CTA.
//
// Our backend handles affiliate offers inside the WhatsApp conversation (Lua),
// not on this page. So here we only DETECT which tasks are affiliate-eligible
// (by Dutch keywords in the title/category) and show a simple informational
// popup pointing the user back to WhatsApp. No multi-step booking flow.

import type { AffiliateKey, TasklistApiTask } from "./types";

type Matcher = { key: AffiliateKey; test: (s: string) => boolean };

const MATCHERS: Matcher[] = [
  { key: "energy", test: (s) => s.includes("energie") || s.includes("stroom") || s.includes("gas") },
  { key: "internet", test: (s) => s.includes("internet") || s.includes("wifi") || s.includes("tv") },
  {
    key: "moving",
    test: (s) =>
      s.includes("verhuisbedrijf") || s.includes("verhuizer") || s.includes("verhuishulp"),
  },
  {
    key: "insurance",
    test: (s) => s.includes("inboedel") || s.includes("verzekering"),
  },
];

/** Returns the affiliate category for a task, or null if it isn't one. */
export function detectAffiliate(task: Pick<TasklistApiTask, "title" | "category">): AffiliateKey | null {
  const s = `${task.title} ${task.category ?? ""}`.toLowerCase();
  for (const m of MATCHERS) {
    if (m.test(s)) return m.key;
  }
  return null;
}

/** Button label shown on affiliate task rows / in the detail sheet. */
export const REGELEN_LABEL = "Regel dit voor mij";

/** Copy shown in the simple info popup, per affiliate category. */
export const AFFILIATE_INFO: Record<
  AffiliateKey,
  { title: string; description: string }
> = {
  energy: {
    title: "Energie regelen",
    description:
      "Lua vergelijkt energieleveranciers voor je nieuwe adres en regelt de overstap — helemaal gratis en zonder gedoe.",
  },
  internet: {
    title: "Internet & TV regelen",
    description:
      "Lua zoekt het beste internet- en tv-pakket voor je nieuwe woning en regelt de aansluiting op tijd.",
  },
  moving: {
    title: "Verhuizer regelen",
    description:
      "Lua brengt je in contact met betrouwbare verhuizers en helpt je een scherpe offerte te vinden.",
  },
  insurance: {
    title: "Verzekering regelen",
    description:
      "Lua helpt je je inboedel- en aansprakelijkheidsverzekering te controleren en goed over te zetten.",
  },
};
