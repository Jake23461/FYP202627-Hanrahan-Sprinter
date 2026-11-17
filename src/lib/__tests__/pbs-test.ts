import type { PersonalBest } from "../../data/types";
import { describeImprovement, findNewPbs, type NewPb } from "../pbs";

describe("describeImprovement", () => {
  const newPb: NewPb = { distanceM: 60, timingMethod: "electronic", timeS: 7.21, repId: "r1", previousS: 7.34 };

  test("says how much faster, without float noise", () => {
    // 7.34 - 7.21 is 0.1299999... in floating point.
    expect(describeImprovement(newPb)).toBe("0.13s faster than 7.34s");
  });

  test("works the same for a hand time", () => {
    expect(describeImprovement({ ...newPb, timingMethod: "hand", timeS: 11.5, previousS: 11.84 })).toBe(
      "0.34s faster than 11.84s",
    );
  });

  test("names a first PB", () => {
    expect(describeImprovement({ ...newPb, previousS: null })).toBe("First electronic 60m PB");
  });
});

function pb(
  distanceM: number,
  timingMethod: PersonalBest["timingMethod"],
  bestTimeS: number,
  repId = `r-${distanceM}-${timingMethod}-${bestTimeS}`,
): PersonalBest {
  return { distanceM, timingMethod, bestTimeS, repId, sessionDate: "2026-11-09" };
}

describe("findNewPbs", () => {
  test("finds nothing when nothing changed", () => {
    const pbs = [pb(100, "hand", 11.84)];

    expect(findNewPbs(pbs, pbs)).toEqual([]);
  });

  test("a first ever PB has no previous time", () => {
    expect(findNewPbs([], [pb(60, "electronic", 7.5, "r1")])).toEqual([
      { distanceM: 60, timingMethod: "electronic", timeS: 7.5, repId: "r1", previousS: null },
    ]);
  });

  test("a faster time is a new PB, with the time it beat", () => {
    expect(findNewPbs([pb(100, "hand", 11.84)], [pb(100, "hand", 11.72, "r2")])).toEqual([
      { distanceM: 100, timingMethod: "hand", timeS: 11.72, repId: "r2", previousS: 11.84 },
    ]);
  });

  test("equalling a PB isn't a new one", () => {
    expect(findNewPbs([pb(100, "hand", 11.84, "old")], [pb(100, "hand", 11.84, "old")])).toEqual([]);
  });

  test("a slower time isn't a new PB", () => {
    expect(findNewPbs([pb(100, "hand", 11.84)], [pb(100, "hand", 11.9)])).toEqual([]);
  });

  test("a new distance is a new PB even when other distances exist", () => {
    const result = findNewPbs([pb(100, "hand", 11.84)], [pb(100, "hand", 11.84), pb(200, "hand", 24.1)]);

    expect(result.map((item) => item.distanceM)).toEqual([200]);
  });

  test("hand and electronic are kept apart", () => {
    // The first electronic 100m is a new PB even though it's slower than the hand PB.
    const result = findNewPbs([pb(100, "hand", 11.5)], [pb(100, "hand", 11.5), pb(100, "electronic", 11.9)]);

    expect(result).toEqual([
      expect.objectContaining({ distanceM: 100, timingMethod: "electronic", previousS: null }),
    ]);
  });

  test("a faster hand time doesn't count against the electronic PB", () => {
    const before = [pb(100, "hand", 11.8), pb(100, "electronic", 11.6)];
    const after = [pb(100, "hand", 11.4), pb(100, "electronic", 11.6)];

    expect(findNewPbs(before, after)).toEqual([
      expect.objectContaining({ timingMethod: "hand", timeS: 11.4, previousS: 11.8 }),
    ]);
  });

  test("lists several new PBs by distance, then timing method", () => {
    const after = [pb(200, "hand", 24), pb(60, "hand", 7.4), pb(60, "electronic", 7.6)];

    expect(findNewPbs([], after).map((item) => `${item.distanceM} ${item.timingMethod}`)).toEqual([
      "60 electronic",
      "60 hand",
      "200 hand",
    ]);
  });

  test("ignores a PB that's gone, for example after a delete", () => {
    expect(findNewPbs([pb(100, "hand", 11.84)], [])).toEqual([]);
  });
});
