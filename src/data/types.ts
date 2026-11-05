// Types for the database (snake_case rows, matching supabase/migrations) and for
// the rest of the app (camelCase). Only src/data should use the row types.

export type AgeGroup = "U16" | "U18" | "U20" | "Senior" | "Masters";
export type SessionFocus = "acceleration" | "max_velocity" | "speed_endurance" | "race" | "other";
export type Surface = "track" | "indoor" | "grass" | "turf" | "road";
export type TimingMethod = "hand" | "electronic";
export type StartType = "blocks" | "crouch" | "standing" | "flying" | "rolling";

export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string;
  events: string[];
  age_group: AgeGroup | null;
  club: string | null;
  created_at: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  session_date: string;
  focus: SessionFocus | null;
  surface: Surface | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RepRow = {
  id: string;
  session_id: string;
  user_id: string;
  position: number;
  distance_m: number;
  time_s: number;
  timing_method: TimingMethod;
  start_type: StartType | null;
  max_effort: boolean;
  note: string | null;
  created_at: string;
};

export type PersonalBestRow = {
  user_id: string;
  distance_m: number;
  timing_method: TimingMethod;
  best_time_s: number;
  rep_id: string;
  session_date: string;
};

// A sign up trigger creates the profile, so the app never inserts one.
type ProfileUpdate = Partial<Omit<ProfileRow, "id" | "created_at">>;

type SessionInsert = Pick<SessionRow, "user_id"> &
  Partial<Omit<SessionRow, "id" | "user_id" | "created_at" | "updated_at">>;

type RepInsert = Pick<RepRow, "session_id" | "user_id" | "position" | "distance_m" | "time_s"> &
  Partial<Pick<RepRow, "timing_method" | "start_type" | "max_effort" | "note">>;

// The shape supabase-js needs to type check queries.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: never;
        Update: ProfileUpdate;
        Relationships: [];
      };
      sessions: {
        Row: SessionRow;
        Insert: SessionInsert;
        Update: Partial<SessionInsert>;
        Relationships: [];
      };
      reps: {
        Row: RepRow;
        Insert: RepInsert;
        Update: Partial<RepInsert>;
        Relationships: [];
      };
    };
    Views: {
      personal_bests: {
        Row: PersonalBestRow;
        Relationships: [];
      };
    };
    Functions: { [_ in never]: never };
  };
};

export type Session = {
  id: string;
  sessionDate: string;
  focus: SessionFocus | null;
  surface: Surface | null;
  rpe: number | null;
  notes: string | null;
};

export type Rep = {
  id: string;
  sessionId: string;
  position: number;
  distanceM: number;
  timeS: number;
  timingMethod: TimingMethod;
  startType: StartType | null;
  maxEffort: boolean;
  note: string | null;
};

export type PersonalBest = {
  distanceM: number;
  timingMethod: TimingMethod;
  bestTimeS: number;
  repId: string;
  sessionDate: string;
};

export type SessionWithReps = Session & { reps: Rep[] };

// What a screen passes in to save. The id, owner and rep order are filled in on save.
export type NewSession = Omit<Session, "id" | "sessionDate"> & { sessionDate?: string };
export type NewRep = Omit<Rep, "id" | "sessionId" | "position">;
