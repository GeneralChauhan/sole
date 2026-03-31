/**
 * Onboarding slice — hardcoded data for "first look at insights" flow.
 * Structured for clarity and easy swap to API later.
 */

/** Fired when overview step CTA is pressed; bottom crossfade listens so leave state is not driven by props. */
export const ONBOARDING_OVERVIEW_EXIT_EVENT = "onboarding-overview-exit";

export type InsightMetric = {
  value: string;
  label: string;
  icon: "calendar" | "messages" | "memos" | "members" | "topics" | "offers";
};

/** Step 2 stats bar: four items with small grey text and icons (plus in light blue). */
export type StatsBarItem = {
  icon: "plus" | "messages" | "threads" | "channels";
  label: string;
  /** e.g. "#" for "25 channels" → "# 25 channels". */
  prefix?: string;
  /** Only "plus" uses light blue; others are grey. */
  highlight?: boolean;
};

/** Step 3 (last): two stacked sections — Collaborating With, Open Loops Found. */
export type SlackSummarySection = {
  label: string;
  /** e.g. "14 people", "8 topics" — optional icon per item (person, document, open, awaited). */
  primary: { value: string; label: string; icon?: "person" | "document" | "open" | "awaited" | null }[];
};

export type OnboardingStepId = "welcome" | "overview" | "slack";

export type OnboardingStep = {
  id: OnboardingStepId;
  title: string;
  subtitle: string;
  metrics?: InsightMetric[];
  /** Step 2: horizontal stats bar with divider (e.g. + Analyzed so far, 600 messages, …). */
  statsBar?: StatsBarItem[];
  /** Step 3: Collaborating With + Open Loops Found stacked sections. */
  slackSummary?: SlackSummarySection[];
  /** Step 3: single line below the sections (e.g. "8 new this week..."). */
  bottomDetail?: string;
  footnote?: string;
  ctaLabel: string;
};

export const ONBOARDING_USER_NAME = "Aayush";

/**
 * 1-based step index (?step= in URL) at which `slackSummary` (and bottom Slack UI) should render.
 * Step 2 (overview) does not show it; step 3 (slack) does.
 */
export const ONBOARDING_SLACK_SUMMARY_STEP_ONE_BASED = 3;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: `Welcome, ${ONBOARDING_USER_NAME}`,
    subtitle:
      "Your open loops are captured & organized.\nTime to start closing them.",
    ctaLabel: "Let's go",
  },
  {
    id: "overview",
    title: "Here's what I've covered.",
    subtitle: "This is across the last 28 days.\nGoing through older conversations as we speak",
    statsBar: [
      { icon: "plus", label: "Covered", highlight: true },
      { icon: "messages", label: "200 emails" },
    ],
    ctaLabel: "Show me what you found",
  },
  {
    id: "slack",
    title: "Here's what I found",
    subtitle: "From 200 most recent emails",
    ctaLabel: "Proceed",
    slackSummary: [
      {
        label: "Collaborating with",
        primary: [
          { value: "8", label: "people", icon: "person" },
          { value: "", label: "across", icon: null },
          { value: "6", label: "topics", icon: "document" },
        ],
      },
      {
        label: "Open loops",
        primary: [
          { value: "11", label: "open on you", icon: "open" },
        ],
      },
    ],
    bottomDetail: "4 new this week & 1 have turned inactive",
  },
];

/** 1-based step in the URL (?step=1 … ?step=N). Returns 0-based index, or null if absent/invalid. */
export function parseOnboardingStepIndexFromParam(
  step: string | string[] | undefined | null
): number | null {
  if (step == null) return null;
  const s = Array.isArray(step) ? step[0] : step;
  if (s === "") return null;
  const n = parseInt(String(s), 10);
  if (Number.isNaN(n)) return null;
  const oneBased = Math.max(1, Math.min(ONBOARDING_STEPS.length, n));
  return oneBased - 1;
}

/**
 * Initial 0-based step from `window.location` (client-only).
 * Use in `useState(() => …)` so the first paint matches `?step` and entry animations run once.
 */
export function getInitialStepIndexFromLocation(): number {
  if (typeof window === "undefined") return 0;
  return parseOnboardingStepIndexFromParam(new URLSearchParams(window.location.search).get("step")) ?? 0;
}
