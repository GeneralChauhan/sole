"use client";

import Image from "next/image";

/**
 * Sol logo for the welcome card (Frame_1).
 * Asset: public/sol-light@2x.png — concentric arcs, burnt orange/terracotta.
 */
export function SolLogo() {
  return (
    <div
      className="onboarding-icon relative flex items-center justify-center"
      // style={{ marginBottom: "var(--onboarding-space-icon-bottom)" }}
      aria-hidden
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/sol-light@2x.png`}
        alt=""
        width={150}
        height={150}
        className="object-contain"
        style={{ marginBottom: "-20px" }}
        priority
      />
    </div>
  );
}
