"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { StatsBarItem } from "./data";
import type { StepChoreography } from "./choreography";
import { staggerMs } from "./choreography";

const iconSize = 20;

const cardShell = "rounded-[8px]";

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ----- Stats icons ----- */

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

export type OnboardingInsightsStripProps =
  | {
      placement: "overview";
      phase: "idle" | "leaving";
      prefersReducedMotion: boolean;
      items: StatsBarItem[];
      choreo: StepChoreography;
    }
  | {
      placement: "slack_stack";
      phase: "enter" | "hidden";
      prefersReducedMotion: boolean;
      bottomDetail: string;
      footerStaggerMs: number;
    };

/**
 * Single surface for the overview stats bar and the Slack “4 new this week…” line.
 * Shared enter/leave animation tokens (`onboarding-insights-strip*` in globals.css).
 * Renders in `overview` under the headline; in `slack_stack` it mounts after Slack rows inside the scroll region.
 */
export function OnboardingInsightsStrip(props: OnboardingInsightsStripProps) {
  if (props.placement === "slack_stack") {
    if (props.phase === "hidden") return null;
    return (
      <div
        className={cn(
          "onboarding-insights-strip onboarding-insights-strip--slack-footer w-full",
          "border border-zinc-200/80 bg-zinc-100/90 px-5 py-4 text-center text-[13px] leading-relaxed text-[#666] mt-[-15px] pt-[28px] z-[-1]",
          !props.prefersReducedMotion && "onboarding-insights-strip__footer-enter"
        )}
        style={{
          letterSpacing: "-0.13px",
          ...(!props.prefersReducedMotion
            ? staggerMs(props.footerStaggerMs)
            : undefined),
        }}
      >
        {props.bottomDetail}
      </div>
    );
  }

  const { phase, prefersReducedMotion, items, choreo } = props;
  const isActive = phase === "idle";
  const isLeaving = phase === "leaving";

  const shellStyle: CSSProperties = {
    marginTop: isActive ? "20px" : "-12px",
  };

  return (
    <div className="onboarding-insights-strip onboarding-insights-strip--overview w-full">
      <div
        className={cn(cardShell, "relative z-0 flex flex-col overflow-hidden")}
        style={shellStyle}
      >
        <div
          className={cn(
            "bg-white rounded-[8px]",
            isActive &&
              !prefersReducedMotion &&
              "onboarding-insights-strip__overview-fade-enter",
            isLeaving &&
              !prefersReducedMotion &&
              "onboarding-insights-strip--overview-leaving"
          )}
          style={
            isActive && !prefersReducedMotion
              ? {
                  ...staggerMs(choreo.metadata),
                  ...(choreo.metadataDurationMs != null
                    ? ({
                        "--overview-strip-duration": `${choreo.metadataDurationMs}ms`,
                      } as CSSProperties)
                    : {}),
                }
              : undefined
          }
        >
          <OverviewStatsRow
            items={items}
            metadataBaseMs={choreo.metadata}
            metadataStaggerMs={choreo.metadataStagger}
            isActive={false}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>
    </div>
  );
}
