"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { SlackSummarySection, StatsBarItem } from "./data";
import type { StepChoreography } from "./choreography";
import { staggerMs } from "./choreography";
import {
  OnboardingInsightsStrip,
  OverviewStatsRow,
} from "./OnboardingInsightsStrip";

/** Must match `.onboarding-insights-strip__footer-enter` / `.onboarding-bottom-slack-last-fade` (fadeSlideUp) in globals.css. */
const ENTER_ANIM_MS = 600;
const REVEAL_ROWS_AFTER_FOOTER_MS = 220;
/** Hold overview / first beat before swapping to first Slack row. */
const SLACK_HOLD_BEFORE_LAST_MS = 240;
/** Time from second-row text start → footer text start (matches slack `footnoteOrFooter`). */
function slackFooterStartAfterSecondRowMs(slackChoreo: StepChoreography) {
  return slackChoreo.footnoteOrFooter;
}
/** Shift after footer line has finished entering (or after second row if no footer). */
function slackShiftAtMs(
  slackChoreo: StepChoreography,
  hasFooter: boolean
) {
  const secondRowAt = SLACK_HOLD_BEFORE_LAST_MS + ENTER_ANIM_MS;
  if (!hasFooter) {
    return secondRowAt + ENTER_ANIM_MS;
  }
  const footerAt =
    secondRowAt + slackFooterStartAfterSecondRowMs(slackChoreo);
  return footerAt + ENTER_ANIM_MS;
}
const SCROLL_VIEWPORT_MAX_H = "min(260px, 52vh)";
const SCROLL_TOP_OFFSET = 12;
const iconSize = 20;

const cardShell = "rounded-[8px]";

const EMPTY_SLACK_SECTIONS: SlackSummarySection[] = [];

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ----- Slack row icons ----- */

function SparkIcon() {
  return (
    <span
      className="inline-flex shrink-0 [&_img]:brightness-90 [&_img]:saturate-[1.35] [&_img]:hue-rotate-[268deg]"
      aria-hidden
    >
      <Image
        src="/star.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        className="size-4 object-contain"
      />
    </span>
  );
}

function PersonIcon() {
  return (
    <Image
      src="/people.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-[20px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

function DocumentIcon() {
  return (
    <Image
      src="/file.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-[20px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

function OpenIcon() {
  return (
    <Image
      src="/open.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-[20px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

function AwaitedIcon() {
  return (
    <Image
      src="/awaited.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-[20px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

type ItemIconType = "person" | "document" | "open" | "awaited";

function ItemIcon({ icon }: { icon?: ItemIconType | null }) {
  if (icon === "document") return <DocumentIcon />;
  if (icon === "open") return <OpenIcon />;
  if (icon === "awaited") return <AwaitedIcon />;
  return <PersonIcon />;
}

function SlackRowContent({ section }: { section: SlackSummarySection }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2 text-zinc-500">
        <SparkIcon />
        <span className="text-sm tracking-[-0.13px]" style={{ color: "#b2b2b2" }}>
          {section.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-x-[4px] gap-y-1">
        {section.primary.map((item, i) => (
          <span key={i} className="flex items-center text-sm">
            {item.icon && (
              <div style={{ margin: "0 8px" }}>
                <ItemIcon icon={item.icon} />
              </div>
            )}
            {item.value !== "" && (
              <span className="mr-[8px] font-medium tracking-[-0.13px] text-zinc-800">
                {item.value}
              </span>
            )}
            <span
              className="tracking-[-0.13px] text-zinc-500"
              style={!item.icon ? { color: "#b2b2b2" } : { color: "#666" }}
            >
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export type OnboardingBottomPanel = "overview" | "slack";

export type OnboardingBottomCardProps = {
  bottomPanel: OnboardingBottomPanel;
  isExiting: boolean;
  exitingStepId: string | null;
  overviewItems?: StatsBarItem[];
  overviewChoreo: StepChoreography;
  slackSections?: SlackSummarySection[];
  slackBottomDetail?: string;
  slackChoreo: StepChoreography;
  /**
   * When false on the slack bottom panel, slack summary rows + footer are not rendered
   * (e.g. 1-based step 2 vs 3).
   */
  showSlackSummary?: boolean;
};

export function OnboardingBottomCard({
  bottomPanel,
  isExiting,
  exitingStepId,
  overviewItems,
  overviewChoreo,
  slackSections,
  slackBottomDetail,
  slackChoreo,
  showSlackSummary = true,
}: OnboardingBottomCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasOverview = !!(overviewItems?.length);
  const hasSlack = !!(slackSections?.length);
  const slackSectionsForEffect = slackSections ?? EMPTY_SLACK_SECTIONS;
  const slackActive =
    bottomPanel === "slack" && !isExiting && hasSlack;
  const slackFooterDelayMs = slackChoreo.footnoteOrFooter;

  /** 0 overview shell | 1 first Slack row | 2 second row | 3 footer line | 4 shift down */
  const [slackSeqPhase, setSlackSeqPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (bottomPanel !== "slack") {
      setSlackSeqPhase(0);
      return;
    }

    let slackSecond: SlackSummarySection | undefined;
    if (slackSections?.length) {
      const [, ...rest] = slackSections;
      slackSecond = rest[0];
    }

    if (prefersReducedMotion) {
      setSlackSeqPhase(4);
      return;
    }

    setSlackSeqPhase(0);

    const t1 = window.setTimeout(() => {
      setSlackSeqPhase(1);
    }, SLACK_HOLD_BEFORE_LAST_MS);

    const hasFooter = !!slackBottomDetail;
    const secondRowAt = SLACK_HOLD_BEFORE_LAST_MS + ENTER_ANIM_MS;
    const footerAt =
      secondRowAt + slackFooterStartAfterSecondRowMs(slackChoreo);
    const shiftAt = slackShiftAtMs(slackChoreo, hasFooter);

    if (!slackSecond) {
      const tFooter = hasFooter
        ? window.setTimeout(() => setSlackSeqPhase(3), footerAt)
        : null;
      const tShift = window.setTimeout(() => setSlackSeqPhase(4), shiftAt);
      return () => {
        clearTimeout(t1);
        if (tFooter) clearTimeout(tFooter);
        clearTimeout(tShift);
      };
    }

    const t2 = window.setTimeout(() => setSlackSeqPhase(2), secondRowAt);
    const t3 = hasFooter
      ? window.setTimeout(() => setSlackSeqPhase(3), footerAt)
      : null;
    const t4 = window.setTimeout(() => setSlackSeqPhase(4), shiftAt);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [
    bottomPanel,
    slackSections,
    prefersReducedMotion,
    slackBottomDetail,
    slackChoreo,
  ]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!slackActive || prefersReducedMotion) {
      el.scrollTop = 0;
      return;
    }
    const snapToFooter = () => {
      el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    };
    snapToFooter();
    requestAnimationFrame(snapToFooter);
  }, [
    slackActive,
    prefersReducedMotion,
    slackSectionsForEffect,
    slackBottomDetail,
    slackSeqPhase,
  ]);

  useEffect(() => {
    if (!slackActive || prefersReducedMotion || !slackBottomDetail) return;
    if (slackSeqPhase < 4) return;
    const el = scrollRef.current;
    if (!el) return;

    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = setTimeout(() => {
      revealTimeoutRef.current = null;
      el.scrollTo({
        top: SCROLL_TOP_OFFSET,
        behavior: "smooth",
      });
    }, REVEAL_ROWS_AFTER_FOOTER_MS);

    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, [
    slackActive,
    prefersReducedMotion,
    slackBottomDetail,
    slackSeqPhase,
  ]);

  if (bottomPanel === "slack" && !showSlackSummary) return null;

  if (!hasOverview && !hasSlack) return null;

  const slackIsActive = bottomPanel === "slack" && !isExiting;
  const showSecondSlackRow =
    slackIsActive && (slackSeqPhase >= 2 || prefersReducedMotion);
  const showSlackFooterText =
    slackIsActive && (slackSeqPhase >= 3 || prefersReducedMotion);

  let slackFirst: SlackSummarySection | undefined;
  let slackSecond: SlackSummarySection | undefined;
  if (hasSlack && slackSections) {
    const [a, ...rest] = slackSections;
    slackFirst = a;
    slackSecond = rest[0];
  }

  const scrollStyle: CSSProperties =
    !slackIsActive || prefersReducedMotion
      ? { overflow: "visible" }
      : { maxHeight: SCROLL_VIEWPORT_MAX_H, overflow: "auto" };

  const slackShellStyle: CSSProperties = {
    marginTop: slackIsActive ? "20px" : "-12px",
  };

  if (bottomPanel === "overview") {
    if (!hasOverview || !overviewItems) return null;
    return (
      <section className="onboarding-card__bottom mt-[-8px] w-full pt-[8px]">
        <div className="onboarding-bottom-shell relative w-full">
          <OnboardingInsightsStrip
            placement="overview"
            phase={
              isExiting && exitingStepId === "overview"
                ? "leaving"
                : "idle"
            }
            prefersReducedMotion={prefersReducedMotion}
            items={overviewItems}
            choreo={overviewChoreo}
          />
        </div>
      </section>
    );
  }

  if (!hasSlack || !slackFirst) return null;

  const firstCardShowsOverviewStats =
    slackSeqPhase === 0 &&
    !prefersReducedMotion &&
    !!(overviewItems?.length);
  const row2TextStaggerMs = 120;

  return (
    <section
      className={cn(
        "onboarding-card__bottom mt-[-8px] w-full pt-[8px]",
        slackIsActive && "onboarding-card__bottom--transparent"
      )}
    >
      <div className="onboarding-bottom-shell relative w-full">
        <div className="w-full">
          <div
            ref={scrollRef}
            className="onboarding-slack-scroll flex w-full flex-col"
            style={scrollStyle}
          >
            <div
              className={cn(
                cardShell,
                "relative z-0 flex flex-col overflow-hidden"
              )}
              style={slackShellStyle}
            >
              <div
                className={cn(
                  "flex flex-col gap-2",
                  slackSeqPhase >= 4 && "onboarding-bottom-slack-stack--shift-down"
                )}
              >
                {/* Shells stay mounted; only inner copy animates between phases. */}
                <div className="px-5 py-4 bg-white rounded-[8px]">
                  {firstCardShowsOverviewStats && overviewItems ? (
                    <div key="slack-phase0-overview">
                      <OverviewStatsRow
                        items={overviewItems}
                        metadataBaseMs={overviewChoreo.metadata}
                        metadataStaggerMs={overviewChoreo.metadataStagger}
                        isActive={false}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    </div>
                  ) : (
                    <div
                      key="slack-phase-first-row"
                      className={cn(
                        !prefersReducedMotion &&
                          (slackSeqPhase >= 1 || !overviewItems?.length) &&
                          "onboarding-bottom-slack-first-row--position-enter"
                      )}
                    >
                      <SlackRowContent section={slackFirst} />
                    </div>
                  )}
                </div>

                {slackSecond ? (
                  <div className="border border-zinc-200/80 px-5 py-4 bg-white rounded-[8px]">
                    {showSecondSlackRow ? (
                      <div
                        key="slack-second-inner"
                        className={cn(
                          !prefersReducedMotion &&
                            "onboarding-insights-strip__footer-enter"
                        )}
                        style={
                          !prefersReducedMotion
                            ? staggerMs(row2TextStaggerMs)
                            : undefined
                        }
                      >
                        <SlackRowContent section={slackSecond} />
                      </div>
                    ) : (
                      <div
                        className="min-h-[28px]"
                        aria-hidden
                      />
                    )}
                  </div>
                ) : null}

                {slackBottomDetail ? (
                  <div
                    className="flex min-h-[48px] items-center justify-center border border-zinc-200/80 bg-zinc-100/90 px-5 py-4 text-center text-[13px] leading-relaxed text-[#666] mt-[-15px] pt-[28px] z-[-1]"
                    style={{ letterSpacing: "-0.13px" }}
                  >
                    {showSlackFooterText ? (
                      <span
                        key="slack-footer-text"
                        className={cn(
                          !prefersReducedMotion &&
                            "onboarding-insights-strip__footer-enter"
                        )}
                        style={
                          !prefersReducedMotion
                            ? staggerMs(slackFooterDelayMs)
                            : undefined
                        }
                      >
                        {slackBottomDetail}
                      </span>
                    ) : (
                      <span className="invisible select-none" aria-hidden>
                        {slackBottomDetail}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
