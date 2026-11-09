import { makeLogDraft, parseLogDraft } from "../logDraft";

const draft = makeLogDraft({
  date: "09/11/2026",
  focus: "acceleration",
  surface: "track",
  rpe: "8",
  notes: "Windy",
  reps: [
    { distanceM: 30, timeS: 4.21, timingMethod: "hand", startType: "blocks", maxEffort: true, note: null },
    { distanceM: 60, timeS: 7.24, timingMethod: "electronic", startType: null, maxEffort: false, note: "easy" },
  ],
});

describe("parseLogDraft", () => {
  test("reads back a saved draft", () => {
    expect(parseLogDraft(JSON.stringify(draft))).toEqual(draft);
  });

  test("returns null when there's no draft", () => {
    expect(parseLogDraft(null)).toBeNull();
  });

  test.each(["", "not json", "null", "42", "[]"])("ignores %j", (text) => {
    expect(parseLogDraft(text)).toBeNull();
  });

  test("ignores a draft from another version", () => {
    expect(parseLogDraft(JSON.stringify({ ...draft, version: 2 }))).toBeNull();
  });

  test("ignores a draft with no reps", () => {
    expect(parseLogDraft(JSON.stringify({ ...draft, reps: [] }))).toBeNull();
  });

  test.each([
    ["an unknown focus", { focus: "hills" }],
    ["an unknown surface", { surface: "sand" }],
    ["a number for RPE", { rpe: 8 }],
    ["a missing date", { date: undefined }],
  ])("ignores a draft with %s", (_case, change) => {
    expect(parseLogDraft(JSON.stringify({ ...draft, ...change }))).toBeNull();
  });

  test.each([
    ["a distance the database would reject", { distanceM: 700 }],
    ["a time with three decimals", { timeS: 10.843 }],
    ["an unknown timing method", { timingMethod: "laser" }],
    ["an unknown start type", { startType: "3-point" }],
    ["a missing max effort", { maxEffort: undefined }],
  ])("ignores a draft with a rep that has %s", (_case, change) => {
    const reps = [{ ...draft.reps[0], ...change }];
    expect(parseLogDraft(JSON.stringify({ ...draft, reps }))).toBeNull();
  });
});
