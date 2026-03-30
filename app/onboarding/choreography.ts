import type { CSSProperties } from "react";
import type { OnboardingStepId } from "./data";

/** Inline style for `.animate-enter` delay (CSS custom property). */
export function staggerMs(ms: number): CSSProperties {
  return { "--stagger": `${ms}ms` } as CSSProperties;
}

export type StepChoreography = {
  /** Logo fade-slide (welcome only in UI). */
  logo: number;
  title: number;
  /** Overrides `.animate-enter` duration (default 600ms). */
  titleDurationMs?: number;
  subtitle: number;
  subtitleDurationMs?: number;
  /** Stats bar / first Slack summary row. */
  metadata: number;
  metadataDurationMs?: number;
  /** Extra ms per subsequent stats chip or Slack row. */
  metadataStagger: number;
  /** Overview footnote or Slack bottom detail line. */
  footnoteOrFooter: number;
  cta: number;
  ctaDurationMs?: number;
};

export const ONBOARDING_CHOREOGRAPHY: Record<OnboardingStepId, StepChoreography> = {
  welcome: {
    logo: 0,
    title: 100,
    subtitle: 200,
    metadata: 0,
    metadataStagger: 0,
    footnoteOrFooter: 0,
    cta: 400,
  },
  /**
   * Insights overview — matches stage.hellosol.app/onboarding/insights captured HTML:
   * title duration-900 delay-150, subtitle duration-600 delay-900, bottom rows delay-900,
   * Covered/stats row duration-700 delay-1650, CTA duration-700 delay-2250.
   */
  overview: {
    logo: 0,
    title: 150,
    titleDurationMs: 900,
    subtitle: 900,
    subtitleDurationMs: 600,
    metadata: 1650,
    metadataDurationMs: 700,
    metadataStagger: 0,
    footnoteOrFooter: 450,
    cta: 2250,
    ctaDurationMs: 700,
  },
  slack: {
    logo: 0,
    title: 100,
    subtitle: 200,
    /** Grey footer after hero; rows reveal via scroll, not stagger. */
    metadata: 0,
    metadataStagger: 0,
    /** Tight vs overview footnote so the bottom line doesn’t feel like a second crossfade after the swap. */
    footnoteOrFooter: 120,
    cta: 700,
  },
};

export function getChoreography(stepId: OnboardingStepId): StepChoreography {
  return ONBOARDING_CHOREOGRAPHY[stepId];
}
