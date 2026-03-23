import { Suspense } from "react";
import { OnboardingFlowClient } from "./onboarding/OnboardingFlowClient";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }}>
      <Suspense
        fallback={
          <div className="min-h-screen" style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }} />
        }
      >
        <OnboardingFlowClient />
      </Suspense>
    </div>
  );
}
