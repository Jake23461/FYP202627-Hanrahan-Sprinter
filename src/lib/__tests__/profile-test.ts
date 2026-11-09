import { getAuthStatus, isProfileComplete } from "../profile";

const complete = { username: "jake_23", events: ["100m"], ageGroup: "Senior" as const };
const fromTrigger = { username: null, events: [], ageGroup: null };

describe("isProfileComplete", () => {
  test("is true with a username, an event and an age group", () => {
    expect(isProfileComplete(complete)).toBe(true);
  });

  test("is false for a new profile from the sign up trigger", () => {
    expect(isProfileComplete(fromTrigger)).toBe(false);
  });

  test.each([
    ["username", { ...complete, username: null }],
    ["events", { ...complete, events: [] }],
    ["age group", { ...complete, ageGroup: null }],
  ])("is false without %s", (_missing, profile) => {
    expect(isProfileComplete(profile)).toBe(false);
  });
});

describe("getAuthStatus", () => {
  const signedIn = { sessionKnown: true, signedIn: true, profile: null, profileFailed: false };

  test("is loading until the saved session has been checked", () => {
    expect(getAuthStatus({ ...signedIn, sessionKnown: false, signedIn: false })).toBe("loading");
  });

  test("is signed out when there's no session", () => {
    expect(getAuthStatus({ ...signedIn, signedIn: false })).toBe("signedOut");
  });

  test("ignores a leftover profile once signed out", () => {
    expect(getAuthStatus({ ...signedIn, signedIn: false, profile: complete })).toBe("signedOut");
  });

  test("is loading while a signed in user's profile is on its way", () => {
    expect(getAuthStatus(signedIn)).toBe("loading");
  });

  test("needs the events step for a new profile", () => {
    expect(getAuthStatus({ ...signedIn, profile: fromTrigger })).toBe("needsProfile");
  });

  test("is ready with a complete profile", () => {
    expect(getAuthStatus({ ...signedIn, profile: complete })).toBe("ready");
  });

  test("reports a profile that couldn't load, rather than asking for it again", () => {
    expect(getAuthStatus({ ...signedIn, profileFailed: true })).toBe("profileError");
  });
});
