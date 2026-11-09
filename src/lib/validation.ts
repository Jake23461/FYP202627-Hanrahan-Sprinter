// Checks for what people type on the auth screens. Each function returns what's
// wrong with the value, or null if it's fine.

const MIN_PASSWORD_LENGTH = 8;

export function validateDisplayName(name: string): string | null {
  return name.trim() === "" ? "Enter your name." : null;
}

export function validateEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? null
    : "Enter a valid email address.";
}

export function validatePassword(password: string): string | null {
  return password.length >= MIN_PASSWORD_LENGTH
    ? null
    : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
}

// The same rule as the check on profiles.username in the database.
export function validateUsername(username: string): string | null {
  return /^[a-z0-9_]{3,20}$/.test(username)
    ? null
    : "Username must be 3 to 20 characters: lowercase letters, numbers or _.";
}
