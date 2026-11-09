import { supabase } from "@/lib/supabase";

import { toProfile, toProfileUpdate } from "./mappers";
import type { Profile, ProfileChanges } from "./types";

// Every signed in user can read all profiles, so unlike sessions and reps these
// queries have to name the row they want.
export async function getMyProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    throw error;
  }
  return toProfile(data);
}

export async function updateMyProfile(userId: string, changes: ProfileChanges): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(toProfileUpdate(changes))
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return toProfile(data);
}
