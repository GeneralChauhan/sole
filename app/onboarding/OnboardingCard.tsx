"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OnboardingStep } from "./data";
import {
  ONBOARDING_STEPS,
  getInitialStepIndexFromLocation,
  parseOnboardingStepIndexFromParam,
} from "./data";
import { getChoreography, staggerMs } from "./choreography";
import { SolLogo } from "./SolLogo";
import { StatsBar } from "./StatsBar";
import { SlackSummary } from "./SlackSummary";

/** Match `.animate-exit` / `.onboarding-step-exit` — `fadeOut` 0.2s + small buffer. */
const STEP_FADE_OUT_MS = 220;

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
    }, STEP_FADE_OUT_MS);
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

  const showBottomShell = stepIndex >= 1;

  const overviewStep = STEPS[1];
  const slackStep = STEPS[2];
  const hasStatsLayer = !!(overviewStep.statsBar?.length);
  const hasSlackLayer = !!(slackStep.slackSummary?.length);

  const overviewChoreo = getChoreography("overview");
  const slackChoreo = getChoreography("slack");
  const slackRowDelaysMs = useMemo(
    () => [slackChoreo.metadata, slackChoreo.metadata + slackChoreo.metadataStagger],
    [slackChoreo.metadata, slackChoreo.metadataStagger]
  );

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
                        maxWidth: "320px",
                        ...(visible && !exitingThis ? staggerMs(ch.subtitle) : {}),
                      }}
                    >
                      <span>{s.subtitle}</span>
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

        {showBottomShell && (
          <section
            className={cn(
              "onboarding-card__bottom mt-[-8px] w-full pt-[8px]",
              stepIndex === 2 && "onboarding-card__bottom--transparent"
            )}
          >
            <div className="onboarding-bottom-shell relative">
              {hasStatsLayer && overviewStep.statsBar && (
                <div
                  className={cn(
                    "onboarding-bottom-layer transition-opacity duration-500 ease-out",
                    stepIndex === 1
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0"
                  )}
                  aria-hidden={stepIndex !== 1}
                >
                  <StatsBar
                    items={overviewStep.statsBar}
                    metadataBaseMs={overviewChoreo.metadata}
                    metadataStaggerMs={overviewChoreo.metadataStagger}
                  />
                </div>
              )}

              {hasSlackLayer && slackStep.slackSummary && (
                <div
                  className={cn(
                    "onboarding-bottom-layer transition-opacity duration-500 ease-out",
                    stepIndex === 2
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none absolute inset-0 opacity-0"
                  )}
                  aria-hidden={stepIndex !== 2}
                >
                  <SlackSummary
                    sections={slackStep.slackSummary}
                    bottomDetail={slackStep.bottomDetail}
                    isActive={stepIndex === 2 && !isExiting}
                    rowDelaysMs={slackRowDelaysMs}
                    footerDelayMs={slackChoreo.footnoteOrFooter}
                  />
                </div>
              )}

              {displayStep.bottomDetail && !displayStep.slackSummary?.length && (
                <p
                  className={cn(
                    "onboarding-slack-section mt-[-12px] flex flex-col gap-3 rounded-[8px] border-b border-l border-r border-zinc-200/80 px-[25px] pt-[28px] pb-[13px] text-[var(--onboarding-footnote-size)] text-[#666]",
                    stepIndex !== 2 && "animate-enter"
                  )}
                  style={
                    stepIndex !== 2
                      ? staggerMs(getChoreography(displayStep.id).footnoteOrFooter)
                      : undefined
                  }
                >
                  {displayStep.bottomDetail}
                </p>
              )}
            </div>
          </section>
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
