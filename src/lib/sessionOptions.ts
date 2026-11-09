// The choices on the Log screen, with the labels people see. The values match
// the check constraints on sessions and reps in the database.

import type { SessionFocus, StartType, Surface, TimingMethod } from "../data/types";

type Option<T extends string> = { value: T; label: string };

export const FOCUS_OPTIONS: Option<SessionFocus>[] = [
  { value: "acceleration", label: "Acceleration" },
  { value: "max_velocity", label: "Max velocity" },
  { value: "speed_endurance", label: "Speed endurance" },
  { value: "race", label: "Race" },
  { value: "other", label: "Other" },
];

export const SURFACE_OPTIONS: Option<Surface>[] = [
  { value: "track", label: "Track" },
  { value: "indoor", label: "Indoor" },
  { value: "turf", label: "Turf" },
  { value: "grass", label: "Grass" },
  { value: "road", label: "Road" },
];

export const START_OPTIONS: Option<StartType>[] = [
  { value: "blocks", label: "Blocks" },
  { value: "crouch", label: "Crouch" },
  { value: "standing", label: "Standing" },
  { value: "flying", label: "Flying" },
  { value: "rolling", label: "Rolling" },
];

export const TIMING_OPTIONS: Option<TimingMethod>[] = [
  { value: "hand", label: "Hand" },
  { value: "electronic", label: "Electronic" },
];

export const DISTANCE_PICKS = [30, 60, 100, 150, 200, 300, 400] as const;
