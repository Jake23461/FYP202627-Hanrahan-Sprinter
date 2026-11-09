// An unsaved session kept on the phone, so swiping the app closed between reps
// doesn't lose them. It's only ever on the phone: nothing reaches the database
// until the session is saved.

import { validateRep } from "../data/mappers";
import type { NewRep, SessionFocus, StartType, Surface, TimingMethod } from "../data/types";
import { FOCUS_OPTIONS, START_OPTIONS, SURFACE_OPTIONS, TIMING_OPTIONS } from "./sessionOptions";

// Bump this if the shape changes, so old drafts are ignored rather than misread.
const DRAFT_VERSION = 1;

export type LogDraft = {
  version: typeof DRAFT_VERSION;
  date: string;
  focus: SessionFocus | null;
  surface: Surface | null;
  rpe: string;
  notes: string;
  reps: NewRep[];
};

export function makeLogDraft(fields: Omit<LogDraft, "version">): LogDraft {
  return { version: DRAFT_VERSION, ...fields };
}

function isOneOf<T extends string>(options: { value: T }[], value: unknown): value is T {
  return options.some((option) => option.value === value);
}

function isRep(value: unknown): value is NewRep {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const rep = value as Record<string, unknown>;
  return (
    typeof rep.distanceM === "number" &&
    typeof rep.timeS === "number" &&
    isOneOf<TimingMethod>(TIMING_OPTIONS, rep.timingMethod) &&
    (rep.startType === null || isOneOf<StartType>(START_OPTIONS, rep.startType)) &&
    typeof rep.maxEffort === "boolean" &&
    (rep.note === null || typeof rep.note === "string") &&
    validateRep({ distanceM: rep.distanceM, timeS: rep.timeS }) === null
  );
}

// Reads a stored draft. Anything damaged, from an older version or with no reps
// comes back as null, so a bad draft is ignored instead of crashing the screen.
export function parseLogDraft(text: string | null): LogDraft | null {
  if (text === null) {
    return null;
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const draft = value as Record<string, unknown>;
  const valid =
    draft.version === DRAFT_VERSION &&
    typeof draft.date === "string" &&
    (draft.focus === null || isOneOf<SessionFocus>(FOCUS_OPTIONS, draft.focus)) &&
    (draft.surface === null || isOneOf<Surface>(SURFACE_OPTIONS, draft.surface)) &&
    typeof draft.rpe === "string" &&
    typeof draft.notes === "string" &&
    Array.isArray(draft.reps) &&
    draft.reps.length > 0 &&
    draft.reps.every(isRep);

  return valid ? (draft as LogDraft) : null;
}
