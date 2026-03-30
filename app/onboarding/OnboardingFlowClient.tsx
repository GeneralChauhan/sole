"use client";

import dynamic from "next/dynamic";

const OnboardingFlow = dynamic(
  () => import("./OnboardingFlow").then((m) => m.OnboardingFlow),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }}
      >
        <p className="onboarding-loading-text">Loading...</p>
      </div>
    ),
  }
);

export function OnboardingFlowClient() {
  return <OnboardingFlow />;
}
