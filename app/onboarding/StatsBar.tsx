"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { StatsBarItem } from "./data";

const EASE_SLICK = [0.16, 1, 0.3, 1] as const;
const STAGGER = 0.08;

const iconSize = 20;

/** Design: light blue plus/sparkle for "Analyzed so far" → star.svg */
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

export function StatsBar({ items }: { items: StatsBarItem[] }) {
  const mid = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, 1);
  const rightItems = items.slice(1);

  return (
    <motion.div
      className="onboarding-stats-bar w-full "
      role="list"
      aria-label="Data summary"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: STAGGER, delayChildren: 0.1 },
        },
      }}
    >
      {/* <motion.div
        className="mb-4 h-px w-full bg-zinc-200"
        aria-hidden
        variants={{
          hidden: { opacity: 0, scaleX: 0.6 },
          visible: {
            opacity: 1,
            scaleX: 1,
            transition: { duration: 0.4, ease: EASE_SLICK },
          },
        }}
      /> */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-2">
          {leftItems.map((item, i) => (
            <motion.div
              key={item.icon + item.label + i}
              className="onboarding-stats-bar-item flex items-center gap-2"
              role="listitem"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: EASE_SLICK },
                },
              }}
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
                {item.prefix && 
                <span className="text-zinc-500" 
                  style={{fontWeight: 500,
                    lineHeight: "150%", /* 19.5px */
                    letterSpacing: "-0.13px",}}>
                      {item.prefix} 
                </span>}
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-row items-center gap-[16px]">
          {rightItems.map((item, i) => (
            <motion.div
              key={item.icon + item.label + (mid + i)}
              className="onboarding-stats-bar-item flex items-center gap-2"
              role="listitem"
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: EASE_SLICK },
                },
              }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
