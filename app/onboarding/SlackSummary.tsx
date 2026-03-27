"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SlackSummarySection } from "./data";

/** Matches StatsBar `duration-500` fade in OnboardingCard. */
const STATS_FADE_MS = 500;
/** Text fade duration — must match `.onboarding-slack-bottom-detail-text-fade` in globals.css. */
const BOTTOM_TEXT_FADE_MS = 380;
/** Slide starts after stats fade + text fade (StatsBar → copy, then strip moves). */
const BOTTOM_SLIDE_DELAY_MS = STATS_FADE_MS + BOTTOM_TEXT_FADE_MS + 48;
/** Whole-card slide duration — must match `.onboarding-slack-card-slide` in globals.css. */
const BOTTOM_SLIDE_DURATION_MS = 1120;
/** Scroll Open Loops row into view after the slide finishes. */
const SCROLL_AFTER_BOTTOM_REVEAL_MS =
  BOTTOM_SLIDE_DELAY_MS + BOTTOM_SLIDE_DURATION_MS + 200;

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
}: SlackSummaryProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const openLoopsRowRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
    }, SCROLL_AFTER_BOTTOM_REVEAL_MS);

    return () => window.clearTimeout(id);
  }, [isActive, sections.length, prefersReducedMotion]);

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

  const bottomDetailTextStyle: CSSProperties | undefined =
    bottomDetail && isActive && !prefersReducedMotion
      ? { animationDelay: `${STATS_FADE_MS}ms` }
      : undefined;

  /** One transform on the whole card: rows + bottom detail slide together under the top card. */
  const slackCardSlideStyle: CSSProperties | undefined =
    bottomDetail && isActive && !prefersReducedMotion
      ? { animationDelay: `${BOTTOM_SLIDE_DELAY_MS}ms` }
      : undefined;

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="onboarding-slack-scroll flex w-full flex-col"
        style={scrollStyle}
      >
        <div
          className={cn(
            slackCard,
            "relative z-0 flex flex-col overflow-hidden",
            bottomDetail && isActive && !prefersReducedMotion && "onboarding-slack-card-slide"
          )}
          style={{ ...cardShellStyle, ...slackCardSlideStyle }}
        >
          <div className="flex flex-col gap-2">
            <div className="border border-zinc-200/80 px-5 py-4 bg-white rounded-[8px]">
              <RowContent section={first} />
            </div>
            {openLoopsSection ? (
              <div
                ref={openLoopsRowRef}
                className="border border-zinc-200/80 px-5 py-4 bg-white rounded-[8px]"
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
                className={cn(
                  isActive && !prefersReducedMotion && "onboarding-slack-bottom-detail-text-fade"
                )}
                style={bottomDetailTextStyle}
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
