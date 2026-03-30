import { Suspense } from "react";
import { OnboardingFlowClient } from "./onboarding/OnboardingFlowClient";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }}>
      <Suspense
        fallback={
          <div
            className="flex min-h-screen items-center justify-center"
            style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }}
          >
            <p className="onboarding-loading-text">Loading...</p>
          </div>
        }
      >
        <OnboardingFlowClient />
      </Suspense>
    </div>
  );
}
