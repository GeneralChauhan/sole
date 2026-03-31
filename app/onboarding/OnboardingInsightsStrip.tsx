"use client";

import { staggerMs } from "./choreography";

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export type OnboardingInsightsStripProps = {
  placement: "slack_stack";
  phase: "enter" | "hidden";
  prefersReducedMotion: boolean;
  bottomDetail: string;
  footerStaggerMs: number;
};

/**
 * Slack footer line inside the scroll region (`onboarding-insights-strip*` in globals.css).
 * Overview stats + crossfade live in OnboardingBottomCard.
 */
export function OnboardingInsightsStrip(props: OnboardingInsightsStripProps) {
  if (props.phase === "hidden") return null;
  return (
    <div
      className={cn(
        "onboarding-insights-strip onboarding-insights-strip--slack-footer",
        "border border-zinc-200/80 bg-zinc-100/90 px-5 py-4 text-center text-[13px] leading-relaxed text-[#666] mt-[-15px] pt-[28px] z-[-1]",
        !props.prefersReducedMotion && "onboarding-insights-strip__footer-enter"
      )}
      style={{
        letterSpacing: "-0.13px",
        ...(!props.prefersReducedMotion
          ? staggerMs(props.footerStaggerMs)
          : undefined),
        margin: "32px 20px 24px 20px",
      }}
    >
      {props.bottomDetail}
    </div>
  );
}
