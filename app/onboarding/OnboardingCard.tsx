"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OnboardingStep } from "./data";
import {
  ONBOARDING_OVERVIEW_EXIT_EVENT,
  ONBOARDING_SLACK_SUMMARY_STEP_ONE_BASED,
  ONBOARDING_STEPS,
  getInitialStepIndexFromLocation,
  parseOnboardingStepIndexFromParam,
} from "./data";
import { getChoreography, staggerMs } from "./choreography";
import { OnboardingBottomCard } from "./OnboardingBottomCard";
import { SolLogo } from "./SolLogo";

/** Match `.animate-exit` / `.onboarding-step-exit` — `fadeOut` 0.2s + small buffer. */
const STEP_FADE_OUT_MS = 220;

/**
 * Overview bottom crossfade: stats `fadeOut` 0.2s, then detail `fadeSlideUp` 0.6s after 0.2s delay.
 * Step must not advance until that finishes or the detail never mounts long enough to animate.
 */
const STEP_OVERVIEW_EXIT_MS = 820;

const STEPS = ONBOARDING_STEPS;

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [stepIndex, setStepIndex] = useState(() => getInitialStepIndexFromLocation());
  const [exitingStepId, setExitingStepId] = useState<string | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topSectionRef = useRef<HTMLElement | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const displayStep: OnboardingStep = exitingStepId
    ? STEPS.find((s) => s.id === exitingStepId) ?? step
    : step;
  const isExiting = !!exitingStepId;

  const goNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
      return;
    }
    const nextIndex = stepIndex + 1;
    setExitingStepId(step.id);
    if (step.id === "overview" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(ONBOARDING_OVERVIEW_EXIT_EVENT));
    }
    const exitDelayMs =
      step.id === "overview" ? STEP_OVERVIEW_EXIT_MS : STEP_FADE_OUT_MS;
    exitTimeoutRef.current = setTimeout(() => {
      const el = topSectionRef.current;
      const fromHeight = el ? el.getBoundingClientRect().height : undefined;
      if (el && fromHeight !== undefined) {
        el.style.height = `${fromHeight}px`;
      }
      setStepIndex(nextIndex);
      setExitingStepId(null);
      exitTimeoutRef.current = null;

      const params = new URLSearchParams(searchParamsRef.current.toString());
      params.set("step", String(nextIndex + 1));
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }, exitDelayMs);
  }, [isLastStep, step.id, onComplete, stepIndex, pathname, router]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const stepParam = searchParams.get("step");
  useLayoutEffect(() => {
    const idx = parseOnboardingStepIndexFromParam(stepParam);
    if (idx !== null) {
      setStepIndex(idx);
    }
  }, [stepParam]);

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

  const overviewStep = STEPS[1];
  const slackStep = STEPS[2];

  const overviewChoreo = getChoreography("overview");
  const slackChoreo = getChoreography("slack");

  const showSlackSummary =
    stepIndex + 1 === ONBOARDING_SLACK_SUMMARY_STEP_ONE_BASED;
  const ctaButton = (
    <button
      type="button"
      onClick={goNext}
      className="onboarding-button onboarding-cta onboarding-cta-tap inline-flex items-center justify-center gap-2 border border-transparent transition-[box-shadow] duration-200 ease-out hover:scale-[1.02]"
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
      <div className="onboarding-step-content flex w-[600px] flex-col items-center text-center">
        <section
          ref={topSectionRef}
          className="onboarding-card__top flex w-full flex-col items-center"
        >
          <div
            className={cn(stepIndex === 0 && !isExiting && "animate-enter")}
            style={stepIndex === 0 && !isExiting ? staggerMs(getChoreography("welcome").logo) : undefined}
          >
            <SolLogo />
          </div>

          <div className="relative w-full min-h-[220px]">
            {STEPS.map((s, i) => {
              const visible =
                (stepIndex === i && !isExiting) ||
                (isExiting && exitingStepId === s.id);
              const exitingThis = isExiting && exitingStepId === s.id;
              const ch = getChoreography(s.id);

              return (
                <div
                  key={s.id}
                  className={cn(
                    "onboarding-step-headline-layer flex w-full flex-col items-center",
                    !exitingThis && "transition-opacity duration-300 ease-out",
                    visible
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none absolute left-0 right-0 top-0 opacity-0",
                    exitingThis && "animate-exit"
                  )}
                  aria-hidden={!visible}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      marginBottom: "var(--onboarding-space-title-bottom)",
                      minHeight: "1.25em",
                    }}
                  >
                    <h1
                      className={cn(
                        "font-serif tracking-tight mx-auto w-[360px] text-[var(--onboarding-title-color)]",
                        visible && !exitingThis && "animate-enter"
                      )}
                      style={{
                        fontSize: "var(--onboarding-title-size)",
                        lineHeight: "var(--onboarding-title-line)",
                        ...(visible && !exitingThis ? staggerMs(ch.title) : {}),
                      }}
                    >
                      {s.title}
                    </h1>
                  </div>

                  <div className="relative mb-0 w-full overflow-hidden">
                    <p
                      className={cn(
                        "mx-auto text-[var(--onboarding-subtitle-color)]",
                        visible && !exitingThis && "animate-enter"
                      )}
                      style={{
                        fontSize: "var(--onboarding-subtitle-size)",
                        lineHeight: "var(--onboarding-subtitle-line)",
                        maxWidth: "380px",
                        ...(visible && !exitingThis ? staggerMs(ch.subtitle) : {}),
                      }}
                    >
                      <span style={{ whiteSpace: "pre-line" }}>{s.subtitle}</span>
                      {s.footnote && !s.statsBar?.length ? <span>{s.footnote}</span> : null}
                    </p>
                  </div>

                  {s.footnote && s.statsBar?.length && visible && !exitingThis ? (
                    <p
                      className="onboarding-footnote animate-enter mb-0 mt-2 w-full text-center text-[var(--onboarding-footnote-color)]"
                      style={{
                        fontSize: "var(--onboarding-footnote-size)",
                        ...staggerMs(ch.footnoteOrFooter),
                      }}
                    >
                      {s.footnote}
                    </p>
                  ) : null}
                  {s.footnote &&
                    !s.statsBar?.length &&
                    !s.metrics?.length &&
                    !s.slackSummary?.length && (
                      <p
                        className={cn(
                          "onboarding-footnote text-[var(--onboarding-footnote-color)]",
                          visible && !exitingThis && "animate-enter"
                        )}
                        style={{
                          fontSize: "var(--onboarding-footnote-size)",
                          marginTop: "var(--onboarding-space-footnote-top)",
                          ...(visible && !exitingThis ? staggerMs(ch.footnoteOrFooter) : {}),
                        }}
                      >
                        {s.footnote}
                      </p>
                    )}
                </div>
              );
            })}
          </div>
        </section>

        {stepIndex >= 1 && (
          <OnboardingBottomCard
            bottomPanel={stepIndex === 1 ? "overview" : "slack"}
            isExiting={isExiting}
            exitingStepId={exitingStepId}
            overviewItems={overviewStep.statsBar}
            overviewChoreo={overviewChoreo}
            overviewDetailLine={slackStep.bottomDetail}
            showSlackSummary={showSlackSummary}
            slackSections={
              showSlackSummary ? slackStep.slackSummary : undefined
            }
            slackBottomDetail={
              showSlackSummary ? slackStep.bottomDetail : undefined
            }
            slackChoreo={slackChoreo}
          />
        )}
      </div>

      {ctaContainerReady &&
        ctaContainerRef?.current &&
        createPortal(
          <div
            className={cn(
              "relative z-[9999] mx-auto transition-opacity duration-200",
              !isExiting && "animate-enter",
              isExiting && "animate-exit"
            )}
            style={{
              maxWidth: "var(--onboarding-card-width)",
              ...(!isExiting ? staggerMs(getChoreography(displayStep.id).cta) : {}),
            }}
          >
            {ctaButton}
          </div>,
          ctaContainerRef.current
        )}
    </>
  );
}
