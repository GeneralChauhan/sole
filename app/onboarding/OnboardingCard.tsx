"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { OnboardingStep } from "./data";
import { ONBOARDING_STEPS } from "./data";
import { SolLogo } from "./SolLogo";
import { InsightMetrics } from "./InsightMetrics";
import { StatsBar } from "./StatsBar";
import { SlackSummary } from "./SlackSummary";

const STEP_FADE_OUT_MS = 500;

type Props = {
  onComplete?: () => void;
  ctaContainerRef?: React.RefObject<HTMLElement | null>;
  ctaContainerReady?: boolean;
};

export function OnboardingCard({
  onComplete,
  ctaContainerRef,
  ctaContainerReady,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [exitingStepId, setExitingStepId] = useState<string | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topSectionRef = useRef<HTMLElement | null>(null);

  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;
  const displayStep: OnboardingStep = exitingStepId
    ? ONBOARDING_STEPS.find((s) => s.id === exitingStepId) ?? step
    : step;
  const isExiting = !!exitingStepId;

  const goNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
      return;
    }
    setExitingStepId(step.id);
    exitTimeoutRef.current = setTimeout(() => {
      const el = topSectionRef.current;
      const fromHeight = el ? el.getBoundingClientRect().height : undefined;
      if (el && fromHeight !== undefined) {
        el.style.height = `${fromHeight}px`;
      }
      setStepIndex((i) => i + 1);
      setExitingStepId(null);
      exitTimeoutRef.current = null;
    }, STEP_FADE_OUT_MS);
  }, [isLastStep, step.id, onComplete]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    const el = topSectionRef.current;
    if (!el) return;
    const explicitHeight = el.style.height;
    if (explicitHeight && explicitHeight !== "auto") {
      const toHeight = el.scrollHeight;
      el.style.height = `${toHeight}px`;
      const onTransitionEnd = () => {
        el.style.height = "";
        el.removeEventListener("transitionend", onTransitionEnd);
      };
      el.addEventListener("transitionend", onTransitionEnd);
      return () => el.removeEventListener("transitionend", onTransitionEnd);
    }
  }, [stepIndex]);

  const isWelcome = displayStep.id === "welcome";
  const isOverview = displayStep.id === "overview";
  const isSlack = displayStep.id === "slack";
  const useSerifHeading = isWelcome || isOverview || isSlack;

  const hasBottomSection =
    (displayStep.statsBar?.length ?? 0) > 0 ||
    (displayStep.slackSummary?.length ?? 0) > 0 ||
    (displayStep.metrics?.length ?? 0) > 0 ||
    !!(
      displayStep.footnote &&
      (displayStep.metrics?.length ?? 0) > 0
    ) ||
    !!displayStep.bottomDetail;

  const ctaButton = (
    <button
      type="button"
      onClick={goNext}
      className="onboarding-button onboarding-cta onboarding-cta-enter onboarding-cta-tap inline-flex items-center justify-center gap-2 border border-transparent transition-[box-shadow] duration-200 ease-out hover:scale-[1.02]"
      style={{
        height: "var(--onboarding-cta-height)",
        paddingLeft: "var(--onboarding-cta-padding-x)",
        paddingRight: "var(--onboarding-cta-padding-x)",
        borderRadius: "4px",
        background: "linear-gradient(180deg, #36393E 0%, #000 100%)",
        color: "var(--onboarding-cta-color)",
        boxShadow:
          "var(--onboarding-cta-shadow), inset 1px 1px 0 var(--onboarding-cta-highlight)",
        fontSize: "var(--onboarding-cta-font-size)",
        fontWeight: "var(--onboarding-cta-font-weight)",
      }}
      aria-label={displayStep.ctaLabel}
    >
      <span>{displayStep.ctaLabel}</span>
      <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden>
        <Image
          src="/CTA_Icon.svg"
          alt=""
          width={17}
          height={18}
          className="h-4 w-4 object-contain "
        />
      </span>
    </button>
  );

  return (
    <>
      <div className="onboarding-step-content flex flex-col items-center text-center w-[600px]">
        {/* Top section: persistent background so it stays visible during step transitions */}
        <section
          ref={topSectionRef}
          className="onboarding-card__top flex w-full flex-col items-center "
        >
          <div
            key={displayStep.id}
            className={`flex w-full flex-col items-center ${isExiting ? "onboarding-step-exit" : ""}`}
          >
            <div className="onboarding-card-logo-enter">
              <SolLogo />
            </div>

            <div
              className="relative w-full overflow-hidden"
              style={{
                marginBottom: "var(--onboarding-space-title-bottom)",
                minHeight: "1.25em",
              }}
            >
              <h1
                key={displayStep.title}
                className={`onboarding-card-title-enter tracking-tight w-[360px] mx-auto text-[var(--onboarding-title-color)] ${useSerifHeading ? "font-serif" : ""}`}
                style={{
                  fontSize: "var(--onboarding-title-size)",
                  lineHeight: "var(--onboarding-title-line)",
                }}
              >
                {displayStep.title}
              </h1>
            </div>

            <div className="relative w-full overflow-hidden mb-0">
              <p
                key={displayStep.subtitle}
                className="onboarding-card-subtitle-enter text-[var(--onboarding-subtitle-color)] mx-auto"
                style={{
                  fontSize: "var(--onboarding-subtitle-size)",
                  lineHeight: "var(--onboarding-subtitle-line)",
                  maxWidth: "320px",
                }}
              >
                <span>{displayStep.subtitle}</span>
                <span>{displayStep.footnote}</span>
              </p>
            </div>

            {displayStep.footnote && displayStep.statsBar?.length ? (
              <p
                className="onboarding-footnote mb-0 mt-2 w-full text-center text-[var(--onboarding-footnote-color)]"
                style={{ fontSize: "var(--onboarding-footnote-size)" }}
              />
            ) : null}
            {displayStep.footnote &&
              !displayStep.statsBar?.length &&
              !displayStep.metrics?.length &&
              !displayStep.slackSummary?.length && (
                <p
                  className="onboarding-footnote onboarding-animate-entry text-[var(--onboarding-footnote-color)]"
                  style={{
                    fontSize: "var(--onboarding-footnote-size)",
                    marginTop: "var(--onboarding-space-footnote-top)",
                    animationDelay: "2s",
                  }}
                >
                  {displayStep.footnote}
                </p>
              )}
          </div>
        </section>

      {hasBottomSection && (
        <section
          className={`onboarding-card__bottom w-full pt-[8px] mt-[-8px] ${isSlack ? "onboarding-card__bottom--transparent" : ""}`}
        >
          {displayStep.statsBar && displayStep.statsBar.length > 0 && (
            <StatsBar items={displayStep.statsBar} />
          )}

          {displayStep.slackSummary && displayStep.slackSummary.length > 0 && (
            <SlackSummary sections={displayStep.slackSummary} />
          )}

          {displayStep.metrics && displayStep.metrics.length > 0 && (
            <InsightMetrics metrics={displayStep.metrics} />
          )}

          {displayStep.footnote &&
            displayStep.metrics &&
            displayStep.metrics.length > 0 && (
              <p
                className="onboarding-footnote onboarding-animate-entry text-[var(--onboarding-footnote-color)]"
                style={{
                  fontSize: "var(--onboarding-footnote-size)",
                  marginTop: "var(--onboarding-space-footnote-top)",
                  animationDelay: "2.5s",
                }}
              >
                {displayStep.footnote}
              </p>
            )}

          {displayStep.bottomDetail && (
            <p
              className="onboarding-slack-section onboarding-slack-section-enter flex flex-col gap-3 rounded-[8px] border-b border-l border-r border-zinc-200/80 px-[25px] pt-[28px] pb-[13px] mt-[-12px] z-[-1000]"
              style={{
                fontSize: "var(--onboarding-footnote-size)",
                color: '#666',
                animationDelay: "1.5s",
              }}
            >
              {displayStep.bottomDetail}
            </p>
          )}
        </section>
      )}
      </div>

      {ctaContainerReady &&
        ctaContainerRef?.current &&
        createPortal(
          <div
            key={displayStep.id}
            className={`relative z-[9999] mx-auto ${isExiting ? "onboarding-step-exit" : ""}`}
            style={{ maxWidth: "var(--onboarding-card-width)" }}
          >
            {ctaButton}
          </div>,
          ctaContainerRef.current
        )}
    </>
  );
}
