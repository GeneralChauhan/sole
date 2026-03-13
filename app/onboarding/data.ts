/**
 * Onboarding slice — hardcoded data for "first look at insights" flow.
 * Structured for clarity and easy swap to API later.
 */

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
  primary: { value: string; label: string; icon?: "person" | "document" | "open" | "awaited" }[];
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

export const ONBOARDING_USER_NAME = "Andrew";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: `Welcome, ${ONBOARDING_USER_NAME}`,
    subtitle:
      "Your open loops are captured & organized. Time to start closing them.",
    ctaLabel: "Let's go",
  },
  {
    id: "overview",
    title: "First, here's what we sifted through so far...",
    subtitle: "This is across the last 14 days.",
    footnote: "Open loops from earlier will be captured soon.",
    statsBar: [
      { icon: "plus", label: "Analyzed so far", highlight: true },
      { icon: "messages", label: "600 messages" },
      { icon: "threads", label: "88 threads" },
      { icon: "channels", label: "25 channels" },
    ],
    ctaLabel: "Show me what you found",
  },
  {
    id: "slack",
    title: "Across your Slack, here's what we found",
    subtitle: "Sol will continue to find older & newer items over time",
    ctaLabel: "Proceed",
    slackSummary: [
      {
        label: "You are collaborating with",
        primary: [
          { value: "14", label: "people", icon: "person" },
          { value: "8", label: "topics", icon: "document" },
        ],
      },
      {
        label: "Open loops found",
        primary: [
          { value: "17", label: "open on you", icon: "open" },
          { value: "37", label: "awaited on others", icon: "awaited" },
        ],
      },
    ],
    bottomDetail: "8 new this week, 7 have turned inactive & 4 are overdue",
  },
];
