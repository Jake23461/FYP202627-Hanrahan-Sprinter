// Works out which personal bests a save improved, by comparing the PB list from
// before the save with the one after. The PBs themselves come from the
// personal_bests view, so nothing about PBs is stored.

import type { PersonalBest, TimingMethod } from "../data/types";
import { formatRepTime } from "./times";

export type NewPb = {
  distanceM: number;
  timingMethod: TimingMethod;
  timeS: number;
  repId: string;
  // null when this is the first PB for that distance and timing method.
  previousS: number | null;
};

// Hand and electronic times are never compared, so they're kept in separate keys.
function pbKey(pb: Pick<PersonalBest, "distanceM" | "timingMethod">): string {
  return `${pb.distanceM}-${pb.timingMethod}`;
}

export function findNewPbs(before: PersonalBest[], after: PersonalBest[]): NewPb[] {
  const previous = new Map(before.map((pb) => [pbKey(pb), pb.bestTimeS]));

  return after
    .filter((pb) => {
      const previousS = previous.get(pbKey(pb));
      // Equalling a PB doesn't count as a new one.
      return previousS === undefined || pb.bestTimeS < previousS;
    })
    .map((pb) => ({
      distanceM: pb.distanceM,
      timingMethod: pb.timingMethod,
      timeS: pb.bestTimeS,
      repId: pb.repId,
      previousS: previous.get(pbKey(pb)) ?? null,
    }))
    .sort((a, b) => a.distanceM - b.distanceM || a.timingMethod.localeCompare(b.timingMethod));
}

// The line under a new PB: "0.13s faster than 7.34" or "First electronic 60m PB".
export function describeImprovement(pb: NewPb): string {
  if (pb.previousS === null) {
    return `First ${pb.timingMethod} ${pb.distanceM}m PB`;
  }
  // Both times are to the hundredth, so rounding the difference removes float noise.
  const gain = (pb.previousS - pb.timeS).toFixed(2);
  return `${gain}s faster than ${formatRepTime(pb.previousS)}`;
}
