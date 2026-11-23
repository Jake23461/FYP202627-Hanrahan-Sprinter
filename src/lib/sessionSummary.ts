// The one line description of a session in the history list:
// "Acceleration", "6×30m · 3×60m", and its best time.

import type { Rep, SessionWithReps, TimingMethod } from "../data/types";
import { FOCUS_OPTIONS } from "./sessionOptions";

export type SessionSummary = {
  title: string;
  summary: string;
  // null when the session has no max effort reps.
  best: { distanceM: number; timeS: number; timingMethod: TimingMethod } | null;
};

// "6×30m · 3×60m", in the order the distances were first run.
function describeReps(reps: Rep[]): string {
  if (reps.length === 0) {
    return "No reps";
  }
  const counts = new Map<number, number>();
  for (const rep of reps) {
    counts.set(rep.distanceM, (counts.get(rep.distanceM) ?? 0) + 1);
  }
  return [...counts].map(([distance, count]) => `${count}×${distance}m`).join(" · ");
}

// The best max effort time at the session's longest distance. Hand and
// electronic times are never compared, so if that distance has both, the
// electronic one is shown, as it's the more accurate.
function findBest(reps: Rep[]): SessionSummary["best"] {
  const maxEffort = reps.filter((rep) => rep.maxEffort);
  if (maxEffort.length === 0) {
    return null;
  }

  const longest = Math.max(...maxEffort.map((rep) => rep.distanceM));
  const atLongest = maxEffort.filter((rep) => rep.distanceM === longest);
  const electronic = atLongest.filter((rep) => rep.timingMethod === "electronic");
  const candidates = electronic.length > 0 ? electronic : atLongest;
  const fastest = candidates.reduce((best, rep) => (rep.timeS < best.timeS ? rep : best));

  return { distanceM: fastest.distanceM, timeS: fastest.timeS, timingMethod: fastest.timingMethod };
}

export function summariseSession(session: SessionWithReps): SessionSummary {
  return {
    title: FOCUS_OPTIONS.find((option) => option.value === session.focus)?.label ?? "Session",
    summary: describeReps(session.reps),
    best: findBest(session.reps),
  };
}
