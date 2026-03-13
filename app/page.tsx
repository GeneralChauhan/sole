import { OnboardingFlow } from "./onboarding";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--onboarding-bg, #ffffff)" }}>
      <OnboardingFlow />
    </div>
  );
}
