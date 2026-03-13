"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { OnboardingCard } from "./OnboardingCard";

const BANNER_EXIT_MS = 400;
const BANNER_DURATION_MS = 2200;

export function OnboardingFlow() {
  const [showBanner, setShowBanner] = useState(false);
  const [bannerExiting, setBannerExiting] = useState(false);
  const ctaContainerRef = useRef<HTMLDivElement | null>(null);
  const [ctaContainerReady, setCtaContainerReady] = useState(false);

  const setCtaRef = useCallback((el: HTMLDivElement | null) => {
    ctaContainerRef.current = el;
    setCtaContainerReady(!!el);
  }, []);

  const restartFlow = useCallback(() => {
    setBannerExiting(true);
    setTimeout(() => {
      setShowBanner(false);
      setBannerExiting(false);
    }, BANNER_EXIT_MS);
  }, []);

  useEffect(() => {
    if (!showBanner) return;
    const t = setTimeout(restartFlow, BANNER_DURATION_MS);
    return () => clearTimeout(t);
  }, [showBanner, restartFlow]);

  return (
    <div
      className="onboarding-flow flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--onboarding-bg)" }}
    >
      {showBanner && (
        <div
          className={`fixed inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-[var(--onboarding-cta-bg)] px-6 ${bannerExiting ? "onboarding-banner-exit" : "onboarding-banner-enter"}`}
          onClick={restartFlow}
          onKeyDown={(e) => e.key === "Enter" && restartFlow()}
          role="button"
          tabIndex={0}
          aria-label="Restart onboarding"
        >
          <p className="onboarding-banner-text-1 text-center font-serif text-2xl text-white">
            You&apos;re all set
          </p>
          <p className="onboarding-banner-text-2 mt-2 text-center text-sm text-white/80">
            Restarting your onboarding…
          </p>
        </div>
      )}

      {!showBanner && (
        <>
          <div
            ref={setCtaRef}
            className="absolute bottom-[60px] left-0 right-0 flex w-full justify-center px-4 py-4 pb-[env(safe-area-inset-bottom)]"
            style={{ backgroundColor: "var(--onboarding-bg)" }}
          />

          <div className="flex flex-1 flex-col items-center px-4 pt-[200px]">
            <div
              className="onboarding-card-wrapper flex flex-col items-center w-full mt-[-80px]"
              style={{ maxWidth: "var(--onboarding-card-width)" }}
            >
              <div className="onboarding-card relative w-full">
                <div className="relative flex flex-col items-center">
                  <OnboardingCard
                    onComplete={() => setShowBanner(true)}
                    ctaContainerRef={ctaContainerRef}
                    ctaContainerReady={ctaContainerReady}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
