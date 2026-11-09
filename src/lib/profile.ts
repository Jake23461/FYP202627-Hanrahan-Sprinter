// Rules about profiles that decide which screens someone can reach.

import type { AgeGroup } from "../data/types";

export const EVENT_OPTIONS = ["60m", "100m", "150m", "200m", "300m", "400m"] as const;
export const AGE_GROUP_OPTIONS: readonly AgeGroup[] = ["U16", "U18", "U20", "Senior", "Masters"];

type ProfileChoices = {
  username: string | null;
  events: string[];
  ageGroup: AgeGroup | null;
};

// A new profile only has a display name, because that's all the sign up trigger sets.
export function isProfileComplete(profile: ProfileChoices): boolean {
  return profile.username !== null && profile.events.length > 0 && profile.ageGroup !== null;
}

// loading: don't know yet, signedOut: welcome and sign in screens,
// needsProfile: signed in but hasn't finished the events step, ready: the tabs,
// profileError: signed in but the profile couldn't be loaded.
export type AuthStatus = "loading" | "signedOut" | "needsProfile" | "ready" | "profileError";

type AuthState = {
  sessionKnown: boolean;
  signedIn: boolean;
  profile: ProfileChoices | null;
  profileFailed: boolean;
};

export function getAuthStatus({ sessionKnown, signedIn, profile, profileFailed }: AuthState): AuthStatus {
  if (!sessionKnown) {
    return "loading";
  }
  if (!signedIn) {
    return "signedOut";
  }
  if (profileFailed) {
    return "profileError";
  }
  if (profile === null) {
    return "loading";
  }
  return isProfileComplete(profile) ? "ready" : "needsProfile";
}
