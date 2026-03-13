"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { SlackSummarySection } from "./data";

const EASE_SLICK = [0.16, 1, 0.3, 1] as const;
const STAGGER = 0.12;

const iconSize = 20;

/** Design: light blue/purple sparkle for section headers → star.svg */
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
      className="size-[14px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

function DocumentIcon() {
  return (
    <Image
      src="/file.svg"
      alt=""
      width={22}
      height={iconSize}
      className="size-[14px] shrink-0 object-contain"
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
      className="size-[14px] shrink-0 object-contain"
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
      className="size-[14px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

type ItemIconType = "person" | "document" | "open" | "awaited";

function ItemIcon({ icon }: { icon?: ItemIconType }) {
  if (icon === "document") return <DocumentIcon />;
  if (icon === "open") return <OpenIcon />;
  if (icon === "awaited") return <AwaitedIcon />;
  return <PersonIcon />;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

type SectionProps = { section: SlackSummarySection; index: number };

function SummarySection({ section, index }: SectionProps) {
  return (
    <motion.div
      className="onboarding-slack-section flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3"
      variants={sectionVariants}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-500">
          <SparkIcon />
          <span className="text-sm">{section.label}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          {section.primary.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 text-sm">
              <ItemIcon icon={item.icon} />
              <span className="font-medium text-zinc-800">{item.value}</span>
              <span className="text-zinc-500">{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function SlackSummary({ sections }: { sections: SlackSummarySection[] }) {
  return (
    <motion.div
      className="onboarding-slack-summary mt-6 w-full space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: STAGGER,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {sections.map((section, i) => (
        <SummarySection key={i} section={section} index={i} />
      ))}
    </motion.div>
  );
}
