// Reading and writing sessions and their reps. RLS limits every query to the
// signed in user's own rows, so these functions don't filter by user themselves.

import { supabase } from "@/lib/supabase";

import { toRep, toRepInserts, toSession, toSessionInsert, validateRep } from "./mappers";
import type { NewRep, NewSession, Rep, Session, SessionWithReps } from "./types";

async function getReps(sessionId: string): Promise<Rep[]> {
  const { data, error } = await supabase
    .from("reps")
    .select("*")
    .eq("session_id", sessionId)
    .order("position");

  if (error) {
    throw error;
  }
  return data.map(toRep);
}

// Newest first.
export async function getSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data.map(toSession);
}

// Returns null if the session doesn't exist or belongs to someone else.
export async function getSession(id: string): Promise<SessionWithReps | null> {
  const { data, error } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return { ...toSession(data), reps: await getReps(id) };
}

// Saves a new session, then its reps. The two inserts aren't one transaction, so
// if the reps fail the session is deleted again rather than left empty.
export async function saveSession(session: NewSession, reps: NewRep[]): Promise<SessionWithReps> {
  for (const rep of reps) {
    const problem = validateRep(rep);
    if (problem) {
      throw new Error(problem);
    }
  }

  const { data: auth, error: authError } = await supabase.auth.getSession();
  if (authError) {
    throw authError;
  }
  if (!auth.session) {
    throw new Error("You need to be signed in to save a session.");
  }
  const userId = auth.session.user.id;

  const { data: savedSession, error: sessionError } = await supabase
    .from("sessions")
    .insert(toSessionInsert(session, userId))
    .select()
    .single();

  if (sessionError) {
    throw sessionError;
  }

  const { data: savedReps, error: repsError } = await supabase
    .from("reps")
    .insert(toRepInserts(reps, savedSession.id, userId))
    .select()
    .order("position");

  if (repsError) {
    await deleteSession(savedSession.id);
    throw repsError;
  }
  return { ...toSession(savedSession), reps: savedReps.map(toRep) };
}

// Deleting a session deletes its reps too (on delete cascade).
export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
