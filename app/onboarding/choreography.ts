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
  subtitle: number;
  /** Stats bar / first Slack summary row. */
  metadata: number;
  /** Extra ms per subsequent stats chip or Slack row. */
  metadataStagger: number;
  /** Overview footnote or Slack bottom detail line. */
  footnoteOrFooter: number;
  cta: number;
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
  overview: {
    logo: 0,
    title: 100,
    subtitle: 200,
    metadata: 300,
    metadataStagger: 80,
    footnoteOrFooter: 450,
    cta: 500,
  },
  slack: {
    logo: 0,
    title: 100,
    subtitle: 200,
    metadata: 300,
    metadataStagger: 100,
    footnoteOrFooter: 500,
    cta: 700,
  },
};

export function getChoreography(stepId: OnboardingStepId): StepChoreography {
  return ONBOARDING_CHOREOGRAPHY[stepId];
}
