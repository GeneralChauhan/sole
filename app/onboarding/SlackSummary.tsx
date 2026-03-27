"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { SlackSummarySection } from "./data";
import { staggerMs } from "./choreography";

/** Must match `.animate-enter` fadeSlideUp duration in globals.css. */
const ENTER_ANIM_MS = 600;

function scrollDelayAfterStagger(
  rowDelaysMs: number[],
  footerDelayMs: number | undefined,
  hasBottomDetail: boolean
): number {
  const footer = hasBottomDetail ? (footerDelayMs ?? 0) : 0;
  const maxRow = rowDelaysMs.length ? Math.max(...rowDelaysMs) : 0;
  return Math.max(maxRow, footer) + ENTER_ANIM_MS + 200;
}

const iconSize = 20;

const SCROLL_VIEWPORT_MAX_H = "min(260px, 52vh)";
const SCROLL_TOP_OFFSET = 12;

const slackCard =
  "rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.07)]";

function SparkIcon() {
  return (
    <Image
      src="/star.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-4 shrink-0 object-contain"
      aria-hidden
    />
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

function RowContent({ section }: { section: SlackSummarySection }) {
  return (
    <div className="flex items-center justify-between gap-4 ">
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

export type SlackSummaryProps = {
  sections: SlackSummarySection[];
  bottomDetail?: string;
  isActive?: boolean;
  /** Stagger for each summary row (fade-slide-up). */
  rowDelaysMs?: number[];
  /** Stagger for bottom detail line. */
  footerDelayMs?: number;
};

function smoothScrollToTarget(scrollEl: HTMLElement, targetEl: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const scrollRect = scrollEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const nextTop =
        scrollEl.scrollTop + (targetRect.top - scrollRect.top) - SCROLL_TOP_OFFSET;
      scrollEl.scrollTo({
        top: Math.max(0, nextTop),
        behavior: "smooth",
      });
    });
  });
}

export function SlackSummary({
  sections,
  bottomDetail,
  isActive = true,
  rowDelaysMs = [300, 400],
  footerDelayMs = 500,
}: SlackSummaryProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const openLoopsRowRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const scrollAfterMs = useMemo(
    () => scrollDelayAfterStagger(rowDelaysMs, footerDelayMs, !!bottomDetail),
    [footerDelayMs, bottomDetail, ...rowDelaysMs]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isActive && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isActive]);

  useEffect(() => {
    if (!isActive || sections.length < 2 || prefersReducedMotion) return;

    const id = window.setTimeout(() => {
      const scrollEl = scrollRef.current;
      const target = openLoopsRowRef.current;
      if (!scrollEl || !target) return;
      smoothScrollToTarget(scrollEl, target);
    }, scrollAfterMs);

    return () => window.clearTimeout(id);
  }, [isActive, sections.length, prefersReducedMotion, scrollAfterMs]);

  if (sections.length === 0) return null;

  const [first, ...rest] = sections;
  const openLoopsSection = rest[0];

  const scrollStyle: CSSProperties =
    !isActive || prefersReducedMotion
      ? { overflow: "visible" }
      : { maxHeight: SCROLL_VIEWPORT_MAX_H, overflow: "auto" };

  const cardShellStyle: CSSProperties = {
    marginTop: isActive ? "20px" : "-12px",
  };

  const row0Delay = rowDelaysMs[0] ?? 0;
  const row1Delay = rowDelaysMs[1] ?? row0Delay;

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="onboarding-slack-scroll flex w-full flex-col"
        style={scrollStyle}
      >
        <div
          className={cn(slackCard, "relative z-0 flex flex-col overflow-hidden")}
          style={cardShellStyle}
        >
          <div className="flex flex-col gap-2">
            <div
              ref={openLoopsRowRef}
              className={cn(
                "border border-zinc-200/80 px-5 py-4 bg-white rounded-[8px]",
                isActive && !prefersReducedMotion && "animate-enter"
              )}
              style={
                isActive && !prefersReducedMotion ? staggerMs(row0Delay) : undefined
              }
            >
              <RowContent section={first} />
            </div>
            {openLoopsSection ? (
              <div
                className={cn(
                  "border border-zinc-200/80 px-5 py-4 bg-white rounded-[8px]",
                  isActive && !prefersReducedMotion && "animate-enter"
                )}
                style={
                  isActive && !prefersReducedMotion ? staggerMs(row1Delay) : undefined
                }
              >
                <RowContent section={openLoopsSection} />
              </div>
            ) : null}
          </div>

          {bottomDetail ? (
            <div
              className="border border-zinc-200/80 bg-zinc-100/90 px-5 py-4 text-center text-[13px] leading-relaxed text-[#666] mt-[-15px] pt-[28px] z-[-1]"
              style={{ letterSpacing: "-0.13px" }}
            >
              <span
                className={cn(isActive && !prefersReducedMotion && "animate-enter")}
                style={
                  isActive && !prefersReducedMotion
                    ? staggerMs(footerDelayMs)
                    : undefined
                }
              >
                {bottomDetail}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
