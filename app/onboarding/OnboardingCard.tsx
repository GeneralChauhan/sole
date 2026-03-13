"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { OnboardingStep } from "./data";
import { SolLogo } from "./SolLogo";
import { InsightMetrics } from "./InsightMetrics";
import { StatsBar } from "./StatsBar";
import { SlackSummary } from "./SlackSummary";

const EASE_SLICK = [0.16, 1, 0.3, 1] as const;
/** First item at 500ms, next at 1s, 1.5s, etc. */
const STAGGER_DELAY = 0.5;
const DELAY_CHILDREN = 0.5;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: DELAY_CHILDREN,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_SLICK },
  },
};

type Props = { step: OnboardingStep };

export function OnboardingCard({ step }: Props) {
  const isWelcome = step.id === "welcome";
  const isOverview = step.id === "overview";
  const isSlack = step.id === "slack";
  const useSerifHeading = isWelcome || isOverview || isSlack;

  const hasBottomSection =
    (step.statsBar?.length ?? 0) > 0 ||
    (step.slackSummary?.length ?? 0) > 0 ||
    (step.metrics?.length ?? 0) > 0 ||
    !!(step.footnote && (step.metrics?.length ?? 0) > 0) ||
    !!step.bottomDetail;

  return (
    <motion.div
      className="onboarding-step-content  flex flex-col items-center text-center w-[600px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top section: logo, heading, subtitle, and any footnote above the divider */}
      <section className="onboarding-card__top flex w-full flex-col items-center border-b border-zinc-200/80 ">
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              },
            },
          }}
        >
          <SolLogo />
        </motion.div>

        <div
          className="relative w-full overflow-hidden"
          style={{
            marginBottom: "var(--onboarding-space-title-bottom)",
            minHeight: "1.25em",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={step.title}
              className={` tracking-tight w-[360px] mx-auto text-[var(--onboarding-title-color)] ${useSerifHeading ? "font-serif" : ""}`}
              style={{
                fontSize: "var(--onboarding-title-size)",
                lineHeight: "var(--onboarding-title-line)",
              }}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE_SLICK }}
            >
              {step.title}
            </motion.h1>
          </AnimatePresence>
        </div>

        <div
          className="relative w-full overflow-hidden mb-0"
          style={{
            // marginBottom: hasBottomSection ? "var(--onboarding-space-subtitle-bottom)" : 0,
            // minHeight: "1.5em",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={step.subtitle}
              className="text-[var(--onboarding-subtitle-color)] mx-auto"
              style={{
                fontSize: "var(--onboarding-subtitle-size)",
                lineHeight: "var(--onboarding-subtitle-line)",
                maxWidth: "320px",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE_SLICK }}
            >
              <span>{step.subtitle}</span>
              <span>{step.footnote}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Footnote that sits above the divider (e.g. overview: "Open loops from earlier...") */}
        {step.footnote && step.statsBar?.length ? (
          <motion.p
            className="onboarding-footnote mb-0 mt-2 w-full text-center text-[var(--onboarding-footnote-color)]"
            style={{ fontSize: "var(--onboarding-footnote-size)" }}
            variants={itemVariants}
          >
          </motion.p>
        ) : null}
        {step.footnote &&
          !step.statsBar?.length &&
          !step.metrics?.length &&
          !step.slackSummary?.length && (
            <motion.p
              className="onboarding-footnote text-[var(--onboarding-footnote-color)]"
              style={{
                fontSize: "var(--onboarding-footnote-size)",
                marginTop: "var(--onboarding-space-footnote-top)",
              }}
              variants={itemVariants}
            >
              {step.footnote}
            </motion.p>
          )}
      </section>

      {/* Bottom section: only render when there is data to show */}
      {hasBottomSection && (
        <section className="onboarding-card__bottom mt-0 w-full">
          {step.statsBar && step.statsBar.length > 0 && (
            <StatsBar items={step.statsBar} />
          )}

          {step.slackSummary && step.slackSummary.length > 0 && (
            <SlackSummary sections={step.slackSummary} />
          )}

          {step.metrics && step.metrics.length > 0 && (
            <InsightMetrics metrics={step.metrics} />
          )}

          {step.footnote && step.metrics && step.metrics.length > 0 && (
            <motion.p
              className="onboarding-footnote text-[var(--onboarding-footnote-color)]"
              style={{
                fontSize: "var(--onboarding-footnote-size)",
                marginTop: "var(--onboarding-space-footnote-top)",
              }}
              variants={itemVariants}
            >
              {step.footnote}
            </motion.p>
          )}

          {step.bottomDetail && (
            <motion.p
              className="onboarding-bottom-detail mt-4 w-full text-left text-[var(--onboarding-footnote-color)]"
              style={{ fontSize: "var(--onboarding-footnote-size)" }}
              variants={itemVariants}
            >
              {step.bottomDetail}
            </motion.p>
          )}
        </section>
      )}
    </motion.div>
  );
}
