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
import { ONBOARDING_OVERVIEW_EXIT_EVENT } from "./data";
import type { StepChoreography } from "./choreography";

const SCROLL_VIEWPORT_MAX_H = "min(260px, 52vh)";
const iconSize = 20;

const cardShell = "rounded-[8px]";

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ----- Overview stats bar (icons + row) — was OnboardingInsightsStrip overview ----- */

function StatsPlusIcon() {
  return (
    <Image
      src="/star.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-5 shrink-0 object-contain"
      aria-hidden
    />
  );
}

function StatsMessagesIcon() {
  return (
    <Image
      src="/msg.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-5 shrink-0 object-contain"
      aria-hidden
    />
  );
}

function StatsThreadsIcon() {
  return (
    <Image
      src="/conversation.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-5 shrink-0 object-contain"
      aria-hidden
    />
  );
}

function StatsHashtagIcon() {
  return (
    <Image
      src="/hash.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-5 shrink-0 object-contain"
      aria-hidden
    />
  );
}

function StatsBarIcon({ item }: { item: StatsBarItem }) {
  switch (item.icon) {
    case "plus":
      return <StatsPlusIcon />;
    case "messages":
      return <StatsMessagesIcon />;
    case "threads":
      return <StatsThreadsIcon />;
    case "channels":
      return <StatsHashtagIcon />;
    default:
      return null;
  }
}

export function OverviewStatsRow({
  items,
  metadataBaseMs,
  metadataStaggerMs,
  isActive,
  prefersReducedMotion,
}: {
  items: StatsBarItem[];
  metadataBaseMs: number;
  metadataStaggerMs: number;
  isActive: boolean;
  prefersReducedMotion: boolean;
}) {
  const rightItems = items.slice(1);
  const leftItems = items.slice(0, 1);

  const delayForIndex = (i: number): CSSProperties => {
    const stagger = metadataStaggerMs === 0 ? 0 : i * metadataStaggerMs;
    return { "--stagger": `${metadataBaseMs + stagger}ms` } as CSSProperties;
  };

  const useEnter = isActive && !prefersReducedMotion;

  return (
    <div
      className="onboarding-stats-bar w-full"
      role="list"
      aria-label="Data summary"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-2">
          {leftItems.map((item, i) => (
            <div
              key={item.icon + item.label + i}
              className={cn(
                "onboarding-stats-bar-item flex flex-row items-center gap-2",
                useEnter && "animate-enter"
              )}
              role="listitem"
              style={useEnter ? delayForIndex(i) : undefined}
            >
              <span
                className={
                  item.highlight ? "text-[#60a5fa]" : "text-zinc-400"
                }
              >
                <StatsBarIcon item={item} />
              </span>
              <span className="text-[13px] text-zinc-500">
                {item.prefix && (
                  <span
                    className="text-zinc-500"
                    style={{
                      fontWeight: 500,
                      lineHeight: "150%",
                      letterSpacing: "-0.13px",
                    }}
                  >
                    {item.prefix}{" "}
                  </span>
                )}
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-row items-center gap-[16px]">
          {rightItems.map((item, i) => (
            <div
              key={item.icon + item.label + i}
              className={cn(
                "onboarding-stats-bar-item flex flex-row items-center gap-2",
                useEnter && "animate-enter"
              )}
              role="listitem"
              style={useEnter ? delayForIndex(leftItems.length + i) : undefined}
            >
              <span
                className={
                  item.highlight ? "text-[#60a5fa]" : "text-zinc-400"
                }
              >
                <StatsBarIcon item={item} />
              </span>
              <span className="text-[13px] text-zinc-500">
                {item.prefix && (
                  <span className="text-zinc-500">{item.prefix} </span>
                )}
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewInsightsCrossfade({
  items,
  choreo,
  prefersReducedMotion,
  detailLine,
  bottomPanel,
}: {
  items: StatsBarItem[];
  choreo: StepChoreography;
  prefersReducedMotion: boolean;
  detailLine: string;
  bottomPanel: OnboardingBottomPanel;
}) {
  const [leaveLatched, setLeaveLatched] = useState(false);

  useLayoutEffect(() => {
    const onExit = () => setLeaveLatched(true);
    window.addEventListener(ONBOARDING_OVERVIEW_EXIT_EVENT, onExit);
    return () =>
      window.removeEventListener(ONBOARDING_OVERVIEW_EXIT_EVENT, onExit);
  }, []);

  const isLeaving = leaveLatched;
  const isActive = !isLeaving;

  const shellStyle: CSSProperties = {
    marginTop: "20px",
  };

  return (
    <div className="onboarding-insights-strip min-h-[78px] onboarding-insights-strip--overview w-full bg-zinc-100\/90 mt-[-15px] relative" 
    style={{ padding: "12px 20px 24px 20px", border: "1px solid #EAEAEA", zIndex: -2 }}
    >
      <div
        className={cn(cardShell, "relative z-0 flex flex-col overflow-hidden")}
        style={shellStyle}
      >
        <div
          className={cn(
            "relative w-full",
            isLeaving && "onboarding-insights-strip--overview-leaving"
          )}
        >
          <div
            className={cn(
              "relative z-[1] w-full",
              (bottomPanel === "overview") &&
                !prefersReducedMotion &&
                "onboarding-insights-strip__overview-fade-enter"
            )}
          >
            <OverviewStatsRow
              items={items}
              metadataBaseMs={choreo.metadata}
              metadataStaggerMs={choreo.metadataStagger}
              isActive={false}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
          <div
            className={cn(
              "onboarding-insights-strip__overview-detail absolute inset-x-0 top-0 bottom-0 z-0 flex items-center justify-center text-center text-[13px] leading-relaxed text-[#666]",
              bottomPanel !== "overview" &&
                "onboarding-insights-strip__overview-detail-enter"
            )}
            style={{ letterSpacing: "-0.13px" }}
            aria-hidden={bottomPanel === "overview"}
          >
            {detailLine}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- Slack row icons ----- */

const slackSections1: SlackSummarySection[] = [
  {
    label: "Collaborating with",
    primary: [
      { value: "8", label: "people", icon: "person" },
      { value: "", label: "across", icon: null },
      { value: "6", label: "topics", icon: "document" },
    ],
  },
  {
    label: "Open loops",
    primary: [{ value: "11", label: "open on you", icon: "open" }],
  },
];

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
  /** Shown after stats fade when the overview CTA is clicked (same line as Slack footer detail). */
  overviewDetailLine?: string;
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
  overviewDetailLine = "4 new this week & 1 have turned inactive",
  slackSections,
  slackBottomDetail: _slackBottomDetail,
  slackChoreo: _slackChoreo,
  showSlackSummary = true,
}: OnboardingBottomCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const hasOverview = !!(overviewItems?.length);
  const hasSlack = !!(slackSections?.length);

  if (bottomPanel === "slack" && !showSlackSummary) return null;

  if (!hasOverview && !hasSlack) return null;

  const slackIsActive = bottomPanel === "slack" && !isExiting;

  let slackFirst: SlackSummarySection | undefined;
  if (hasSlack && slackSections) {
    slackFirst = slackSections[0];
  }

  const scrollStyle: CSSProperties =
    !slackIsActive || prefersReducedMotion
      ? { overflow: "visible" }
      : { maxHeight: SCROLL_VIEWPORT_MAX_H, overflow: "auto" };

  if (bottomPanel === "overview") {
    if (!hasOverview || !overviewItems) return null;
  } else if (!hasSlack || !slackFirst) {
    return null;
  }

  return (
    <section
      className={cn(
        "onboarding-card__bottom mt-[-8px] w-full",
        !prefersReducedMotion &&
          bottomPanel === "slack" &&
          "onboarding-card__bottom--slide-slow"
      )}
      // style={{ padding: "12px 20px 24px 20px" }}
    >
      <div className="onboarding-bottom-shell relative w-full">
        
         
        
          {/* <div className="w-full">
            <div
              ref={scrollRef}
              className="onboarding-slack-scroll flex w-full flex-col"
              style={scrollStyle}
            >
              {slackSections.map((section, index) => (
                <div
                  key={index}
                  className="w-full rounded-[8px] border border-zinc-200/80 bg-white"
                  style={{ padding: "12px 20px 24px 20px" }}
                >
                  <SlackRowContent section={section} />
                </div>
              ))}
            </div>
          </div> */}

            <div className="w-full flex flex-col gap-2 mt-[27px]">

          {  
            slackSections1.map((section, index) => (
              console.log(bottomPanel, "bottomPanel"),
              <div key={index} className={cn(
               "w-full bg-white rounded-[8px] border border-zinc-200/80 gap-2",
                (bottomPanel === "slack") ? "opacity-[1]" : "opacity-0"
              )} style={{ padding: "12px 20px 24px 20px" }}>
                <SlackRowContent section={section} />
              </div>
            ))
          }
            </div>

          {overviewItems && (
            <OverviewInsightsCrossfade
              items={overviewItems}
              choreo={overviewChoreo}
              prefersReducedMotion={prefersReducedMotion}
              detailLine={overviewDetailLine}
              bottomPanel={bottomPanel}
            />
          )}
      </div>
    </section>
  );
}
