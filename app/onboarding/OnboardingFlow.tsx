"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ONBOARDING_STEPS } from "./data";
import { OnboardingCard } from "./OnboardingCard";

const EASE_SLICK = [0.16, 1, 0.3, 1] as const;
const TRANSITION_DURATION = 0.65;
const STEP_FADE_OUT_MS = 500;
/** CTA appears after first few card items (logo, title, subtitle ≈ 1.5s) */
const CTA_APPEAR_DELAY_S = 1.5;
const BANNER_DURATION_MS = 2200;

export function OnboardingFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLastStep) {
      setShowBanner(true);
      return;
    }
    setStepIndex((i) => i + 1);
  }, [isLastStep]);

  const restartFlow = useCallback(() => {
    setShowBanner(false);
    setStepIndex(0);
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
      <AnimatePresence mode="wait">
        {showBanner ? (
          <motion.div
            key="banner"
            className="fixed inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-[var(--onboarding-cta-bg)] px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_SLICK }}
            onClick={restartFlow}
            onKeyDown={(e) => e.key === "Enter" && restartFlow()}
            role="button"
            tabIndex={0}
            aria-label="Restart onboarding"
          >
            <motion.p
              className="text-center font-serif text-2xl  text-white"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASE_SLICK }}
            >
              You&apos;re all set
            </motion.p>
            <motion.p
              className="mt-2 text-center text-sm text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              Restarting your onboarding…
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showBanner ? null : (
        <>
          {/* Card area: centered in remaining space */}
          <div className="flex flex-1 flex-col items-center px-4 pt-[200px]">
            <motion.div
              className="onboarding-card-wrapper flex flex-col items-center w-full"
              style={{ maxWidth: "var(--onboarding-card-width)" }}
            >
              <motion.div
                layout
                className="onboarding-card relative w-full overflow-hidden rounded-2xl"
                style={{
                  boxShadow: "var(--onboarding-card-shadow)",
                  backgroundColor: "var(--onboarding-card-bg)",
                }}
                transition={{
                  layout: { duration: TRANSITION_DURATION, ease: EASE_SLICK },
                }}
              >
                <motion.div
                  layout
                  className="relative flex flex-col items-center"
                  transition={{
                    layout: { duration: TRANSITION_DURATION, ease: EASE_SLICK },
                  } as const}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: STEP_FADE_OUT_MS / 1000,
                          ease: EASE_SLICK,
                        },
                      }}
                      className="flex flex-col items-center w-full"
                    >
                      <OnboardingCard step={step} />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* CTA fixed at bottom of page (per design) */}
          <div
            className="absolute bottom-[60px] left-0 right-0 flex w-full justify-center px-4 py-4 pb-[env(safe-area-inset-bottom)]"
            style={{ backgroundColor: "var(--onboarding-bg)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                className="mx-auto"
                style={{ maxWidth: "var(--onboarding-card-width)" }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: {
                    duration: STEP_FADE_OUT_MS / 1000,
                    ease: EASE_SLICK,
                  },
                }}
              >
                <motion.button
                  type="button"
                  onClick={goNext}
                  className="onboarding-button onboarding-cta inline-flex items-center justify-center gap-2 border border-transparent transition-[box-shadow] duration-200 ease-out hover:scale-[1.02]"
                  style={{
                    height: "var(--onboarding-cta-height)",
                    paddingLeft: "var(--onboarding-cta-padding-x)",
                    paddingRight: "var(--onboarding-cta-padding-x)",
                    backgroundColor: "var(--onboarding-cta-bg)",
                    color: "var(--onboarding-cta-color)",
                    boxShadow:
                      "var(--onboarding-cta-shadow), inset 1px 1px 0 var(--onboarding-cta-highlight)",
                    borderRadius: "var(--onboarding-cta-radius)",
                    fontSize: "var(--onboarding-cta-font-size)",
                    fontWeight: "var(--onboarding-cta-font-weight)",
                  }}
                  aria-label={step.ctaLabel}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: EASE_SLICK,
                    delay: CTA_APPEAR_DELAY_S,
                  }}
                >
                  <span>{step.ctaLabel}</span>
                  <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden>
                    <Image
                      src="/CTA_Icon.svg"
                      alt=""
                      width={17}
                      height={18}
                      className="h-4 w-4 object-contain "
                    />
                  </span>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
