"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { StatsBarItem } from "./data";

const iconSize = 20;

function PlusIcon() {
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

function MessagesIcon() {
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

function ThreadsIcon() {
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

function HashtagIcon() {
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
      return <PlusIcon />;
    case "messages":
      return <MessagesIcon />;
    case "threads":
      return <ThreadsIcon />;
    case "channels":
      return <HashtagIcon />;
    default:
      return null;
  }
}

export function StatsBar({
  items,
  metadataBaseMs = 0,
  metadataStaggerMs = 80,
}: {
  items: StatsBarItem[];
  /** First chip delay (ms); from onboarding choreography. */
  metadataBaseMs?: number;
  metadataStaggerMs?: number;
}) {
  const rightItems = items.slice(1);
  const leftItems = items.slice(0, 1);

  const delayForIndex = (i: number): CSSProperties =>
    ({ "--stagger": `${metadataBaseMs + i * metadataStaggerMs}ms` }) as CSSProperties;

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
              className="onboarding-stats-bar-item animate-enter flex flex-row items-center gap-2"
              role="listitem"
              style={delayForIndex(i)}
            >
              <span
                className={
                  item.highlight
                    ? "text-[#60a5fa]"
                    : "text-zinc-400"
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
              className="onboarding-stats-bar-item animate-enter flex flex-row items-center gap-2"
              role="listitem"
              style={delayForIndex(leftItems.length + i)}
            >
              <span
                className={
                  item.highlight
                    ? "text-[#60a5fa]"
                    : "text-zinc-400"
                }
              >
                <StatsBarIcon item={item} />
              </span>
              <span className="text-[13px] text-zinc-500">
                {item.prefix && <span className="text-zinc-500">{item.prefix} </span>}
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
