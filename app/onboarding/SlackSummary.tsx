"use client";

import Image from "next/image";
import type { SlackSummarySection } from "./data";

const STAGGER_MS = 120;
const DELAY_CHILDREN_MS = 80;
const iconSize = 20;

function SparkIcon() {
  return (
    <Image
      src="/star.svg"
      alt=""
      width={iconSize}
      height={iconSize}
      className="size-4 shrink-0 object-contain"
      aria-hidden
      color="##666666"
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
      color="##666666"
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
      color="##666666"
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
      color="##666666"
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
      color="##666666"
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

type SectionProps = { section: SlackSummarySection; index: number };

function SummarySection({ section, index }: SectionProps) {
  return (
    <div
      className="onboarding-slack-section onboarding-slack-section-enter flex flex-col gap-3 rounded-[8px] border border-zinc-200/80 bg-white px-[24px] py-[20px]"
      style={{
        animationDelay: `${DELAY_CHILDREN_MS + index * STAGGER_MS}ms`,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-500">
          <SparkIcon />
          <span className="text-sm tracking-[-0.13px]" style={{ color: '#b2b2b2' }}>{section.label}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-[4px] gap-y-1">
          {section.primary.map((item, i) => (
            <span key={i} className="flex items-center text-sm">
              {item.icon && <div style={{ margin: '0 8px' }}>
                <ItemIcon icon={item.icon} /> 
              </div>}
              {item.value !== "" && <span className="font-medium text-zinc-800 tracking-[-0.13px] mr-[8px]">{item.value}</span>}
              <span className="text-zinc-500 tracking-[-0.13px]" style={!item.icon ? { color: '#b2b2b2' } : { color: '#666' }}>{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SlackSummary({ sections }: { sections: SlackSummarySection[] }) {
  return (
    <div className="onboarding-slack-summary mt-6 w-full space-y-3">
      {sections.map((section, i) => (
        <SummarySection key={i} section={section} index={i} />
      ))}
    </div>
  );
}
