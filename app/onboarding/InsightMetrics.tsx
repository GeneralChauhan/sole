"use client";

import type { InsightMetric } from "./data";
import { MetricIcon } from "./icons";

export function InsightMetrics({ metrics }: { metrics: InsightMetric[] }) {
  return (
    <div
      className="onboarding-metrics grid w-full grid-cols-3 gap-6"
      style={{ marginTop: "var(--onboarding-space-metrics-top)" }}
      role="list"
      aria-label="Insight summary"
    >
      {metrics.map((m, i) => (
        <div
          key={m.icon + m.label}
          className="onboarding-metric-item flex flex-col items-center gap-2 text-center"
          style={{ animationDelay: `${100 * (i + 1)}ms` }}
          role="listitem"
        >
          <span
            className="flex items-center justify-center rounded-lg bg-[var(--onboarding-metric-icon-bg)] text-zinc-500"
            style={{
              width: "var(--onboarding-metric-icon-size)",
              height: "var(--onboarding-metric-icon-size)",
            }}
          >
            <MetricIcon icon={m.icon} />
          </span>
          <span
            className="tabular-nums text-[var(--onboarding-title-color)]"
            style={{
              fontSize: "var(--onboarding-metric-value-size)",
              fontWeight: "var(--onboarding-metric-value-weight)",
            }}
          >
            {m.value}
          </span>
          <span
            className="text-[var(--onboarding-metric-label-color)]"
            style={{ fontSize: "var(--onboarding-metric-label-size)" }}
          >
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}
