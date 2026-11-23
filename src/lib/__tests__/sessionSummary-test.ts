import type { Rep, SessionWithReps } from "../../data/types";
import { summariseSession } from "../sessionSummary";

let nextId = 1;
function rep(distanceM: number, timeS: number, changes: Partial<Rep> = {}): Rep {
  const id = `r${nextId++}`;
  return {
    id,
    sessionId: "s1",
    position: nextId,
    distanceM,
    timeS,
    timingMethod: "hand",
    startType: "blocks",
    maxEffort: true,
    note: null,
    ...changes,
  };
}

function session(reps: Rep[], focus: SessionWithReps["focus"] = "acceleration"): SessionWithReps {
  return { id: "s1", sessionDate: "2026-11-09", focus, surface: null, rpe: null, notes: null, reps };
}

describe("summariseSession", () => {
  test("uses the focus as the title", () => {
    expect(summariseSession(session([rep(30, 4.2)], "max_velocity")).title).toBe("Max velocity");
  });

  test("falls back to Session when there's no focus", () => {
    expect(summariseSession(session([rep(30, 4.2)], null)).title).toBe("Session");
  });

  test("counts reps per distance in the order they were run", () => {
    const reps = [rep(30, 4.2), rep(30, 4.1), rep(60, 7.3), rep(30, 4.0)];
    expect(summariseSession(session(reps)).summary).toBe("3×30m · 1×60m");
  });

  test("says when there are no reps", () => {
    expect(summariseSession(session([])).summary).toBe("No reps");
  });

  test("shows the best time at the longest distance", () => {
    const reps = [rep(30, 3.9), rep(60, 7.4), rep(60, 7.21)];
    expect(summariseSession(session(reps)).best).toEqual({ distanceM: 60, timeS: 7.21, timingMethod: "hand" });
  });

  test("ignores training reps, even at a longer distance", () => {
    const reps = [rep(60, 7.4), rep(100, 12.5, { maxEffort: false })];
    expect(summariseSession(session(reps)).best).toMatchObject({ distanceM: 60, timeS: 7.4 });
  });

  test("has no best time without max effort reps", () => {
    expect(summariseSession(session([rep(100, 12.5, { maxEffort: false })])).best).toBeNull();
  });

  test("never compares hand with electronic, and prefers electronic", () => {
    const reps = [rep(100, 11.2, { timingMethod: "hand" }), rep(100, 11.6, { timingMethod: "electronic" })];
    expect(summariseSession(session(reps)).best).toEqual({
      distanceM: 100,
      timeS: 11.6,
      timingMethod: "electronic",
    });
  });

  test("counts flying reps as the session's best, since it's not a PB", () => {
    const reps = [rep(30, 3.1, { startType: "flying" }), rep(30, 4.0)];
    expect(summariseSession(session(reps)).best).toMatchObject({ timeS: 3.1 });
  });
});
