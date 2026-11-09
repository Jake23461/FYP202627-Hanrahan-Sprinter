import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { onAuthChange } from "../data/auth";
import { getMyProfile, updateMyProfile } from "../data/profiles";
import type { Profile, ProfileChanges } from "../data/types";
import { getAuthStatus, type AuthStatus } from "../lib/profile";

type AuthContextValue = {
  status: AuthStatus;
  profile: Profile | null;
  saveProfile: (changes: ProfileChanges) => Promise<void>;
  retryProfile: () => void;
};

type ProfileResult = {
  userId: string;
  attempt: number;
  profile: Profile | null;
  failed: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Holds who's signed in and their profile, for the whole app. The navigators
// read the status to decide which screens exist.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionKnown, setSessionKnown] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ProfileResult | null>(null);

  useEffect(() => {
    return onAuthChange((id) => {
      setUserId(id);
      setSessionKnown(true);
    });
  }, []);

  // Keyed on the user's id, so a token refresh doesn't reload the profile.
  useEffect(() => {
    if (userId === null) {
      return;
    }

    // Ignore the answer if they've signed out or retried while it was on its way.
    let current = true;
    getMyProfile(userId)
      .then((loaded) => {
        if (current) {
          setResult({ userId, attempt, profile: loaded, failed: false });
        }
      })
      .catch(() => {
        if (current) {
          setResult({ userId, attempt, profile: null, failed: true });
        }
      });

    return () => {
      current = false;
    };
  }, [userId, attempt]);

  const saveProfile = useCallback(
    async (changes: ProfileChanges) => {
      if (userId === null) {
        throw new Error("Not signed in");
      }
      const saved = await updateMyProfile(userId, changes);
      setResult({ userId, attempt, profile: saved, failed: false });
    },
    [userId, attempt],
  );

  const retryProfile = useCallback(() => setAttempt((count) => count + 1), []);

  // A result only counts for the user and attempt it was loaded for, so a
  // previous user's profile can never show after signing out and back in.
  const currentResult = result?.userId === userId && result?.attempt === attempt ? result : null;
  const profile = currentResult?.profile ?? null;
  const profileFailed = currentResult?.failed ?? false;

  const status = getAuthStatus({
    sessionKnown,
    signedIn: userId !== null,
    profile,
    profileFailed,
  });

  return (
    <AuthContext.Provider value={{ status, profile, saveProfile, retryProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth has to be used inside AuthProvider");
  }
  return value;
}
