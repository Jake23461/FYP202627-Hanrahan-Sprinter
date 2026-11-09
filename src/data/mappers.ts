// Turns database rows into app types and back, and checks reps before saving.
// No Supabase import here, so all of it can be unit tested without a connection.

import type {
  Database,
  NewRep,
  NewSession,
  PersonalBest,
  PersonalBestRow,
  Profile,
  ProfileChanges,
  ProfileRow,
  Rep,
  RepRow,
  Session,
  SessionRow,
} from "./types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];
type RepInsert = Database["public"]["Tables"]["reps"]["Insert"];

const MIN_DISTANCE_M = 10;
const MAX_DISTANCE_M = 600;
const MAX_TIME_S = 9999.99; // The largest value numeric(6,2) can hold.

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    events: row.events,
    ageGroup: row.age_group,
    club: row.club,
  };
}

// Only includes what's being changed, so the other columns are left alone.
export function toProfileUpdate(changes: ProfileChanges): ProfileUpdate {
  return {
    ...(changes.username === undefined ? {} : { username: changes.username }),
    ...(changes.displayName === undefined ? {} : { display_name: changes.displayName }),
    ...(changes.events === undefined ? {} : { events: changes.events }),
    ...(changes.ageGroup === undefined ? {} : { age_group: changes.ageGroup }),
  };
}

export function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    sessionDate: row.session_date,
    focus: row.focus,
    surface: row.surface,
    rpe: row.rpe,
    notes: row.notes,
  };
}

export function toRep(row: RepRow): Rep {
  return {
    id: row.id,
    sessionId: row.session_id,
    position: row.position,
    distanceM: row.distance_m,
    timeS: row.time_s,
    timingMethod: row.timing_method,
    startType: row.start_type,
    maxEffort: row.max_effort,
    note: row.note,
  };
}

export function toPersonalBest(row: PersonalBestRow): PersonalBest {
  return {
    distanceM: row.distance_m,
    timingMethod: row.timing_method,
    bestTimeS: row.best_time_s,
    repId: row.rep_id,
    sessionDate: row.session_date,
  };
}

export function toSessionInsert(session: NewSession, userId: string): SessionInsert {
  return {
    user_id: userId,
    // Leaving the date out lets the database default to today.
    ...(session.sessionDate === undefined ? {} : { session_date: session.sessionDate }),
    focus: session.focus,
    surface: session.surface,
    rpe: session.rpe,
    notes: session.notes,
  };
}

// The order of the array becomes each rep's position, starting at 1.
export function toRepInserts(reps: NewRep[], sessionId: string, userId: string): RepInsert[] {
  return reps.map((rep, index) => ({
    session_id: sessionId,
    user_id: userId,
    position: index + 1,
    distance_m: rep.distanceM,
    time_s: rep.timeS,
    timing_method: rep.timingMethod,
    start_type: rep.startType,
    max_effort: rep.maxEffort,
    note: rep.note,
  }));
}

// Returns what's wrong with a rep, or null if it can be saved.
// More than two decimals is rejected because numeric(6,2) would round to the
// nearest hundredth (10.843 to 10.84), not up as parseTime does (10.85).
export function validateRep(rep: Pick<NewRep, "distanceM" | "timeS">): string | null {
  const { distanceM, timeS } = rep;

  if (!Number.isInteger(distanceM) || distanceM < MIN_DISTANCE_M || distanceM > MAX_DISTANCE_M) {
    return `Distance must be a whole number from ${MIN_DISTANCE_M} to ${MAX_DISTANCE_M} metres.`;
  }
  if (!Number.isFinite(timeS) || timeS <= 0 || timeS > MAX_TIME_S) {
    return `Time must be above 0 and at most ${MAX_TIME_S} seconds.`;
  }
  if (Number(timeS.toFixed(2)) !== timeS) {
    return "Time can have at most two decimal places.";
  }
  return null;
}
