import { supabase } from "@/lib/supabase";

// The sign up trigger reads display_name from this metadata to make the profile.
export async function signUp(displayName: string, email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });

  if (error) {
    throw error;
  }
  // With email confirmation on, Supabase creates the user but gives no session yet.
  if (!data.session) {
    throw Object.assign(new Error("No session after sign up"), { code: "email_not_confirmed" });
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

// Calls back with the user's id or null straight away, then on every change.
// Supabase says not to call other Supabase functions inside this callback, so it
// only passes the id on. Returns a function that stops listening.
export function onAuthChange(callback: (userId: string | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user.id ?? null);
  });

  return () => data.subscription.unsubscribe();
}
