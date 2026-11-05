import { supabase } from "@/lib/supabase";

import { toPersonalBest } from "./mappers";
import type { PersonalBest } from "./types";

// The signed in user's bests, one per distance and timing method.
export async function getPersonalBests(): Promise<PersonalBest[]> {
  const { data, error } = await supabase
    .from("personal_bests")
    .select("*")
    .order("distance_m")
    .order("timing_method");

  if (error) {
    throw error;
  }
  return data.map(toPersonalBest);
}
