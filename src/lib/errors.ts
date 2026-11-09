// Turns errors from Supabase Auth and Postgres into messages people can act on.

const MESSAGES: Record<string, string> = {
  invalid_credentials: "That email or password isn't right.",
  user_already_exists: "An account with that email already exists. Try signing in.",
  email_exists: "An account with that email already exists. Try signing in.",
  email_address_invalid: "That email address doesn't look right.",
  email_not_confirmed: "Confirm your email address, then sign in.",
  weak_password: "That password is too weak. Try a longer one.",
  over_request_rate_limit: "Too many attempts. Wait a minute and try again.",
  over_email_send_rate_limit: "Too many attempts. Wait a minute and try again.",
  // Postgres unique violation. Username is the only unique column the app can change.
  "23505": "That username is taken. Try another.",
};

const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";
const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

export function errorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return DEFAULT_MESSAGE;
  }

  const { code, name, message } = error as { code?: unknown; name?: unknown; message?: unknown };

  if (typeof code === "string" && Object.prototype.hasOwnProperty.call(MESSAGES, code)) {
    return MESSAGES[code];
  }
  if (name === "AuthRetryableFetchError" || message === "Network request failed") {
    return NETWORK_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
