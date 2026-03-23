"use client";

import dynamic from "next/dynamic";

const OnboardingFlow = dynamic(
  () => import("./OnboardingFlow").then((m) => m.OnboardingFlow),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen" style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }} />
    ),
  }
);

export function OnboardingFlowClient() {
  return <OnboardingFlow />;
}
