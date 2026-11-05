import {
  toPersonalBest,
  toRep,
  toRepInserts,
  toSession,
  toSessionInsert,
  validateRep,
} from "../mappers";
import type { NewRep, NewSession, PersonalBestRow, RepRow, SessionRow } from "../types";

const newRep: NewRep = {
  distanceM: 100,
  timeS: 11.84,
  timingMethod: "hand",
  startType: "blocks",
  maxEffort: true,
  note: null,
};

describe("rows to app types", () => {
  test("toSession maps the columns and leaves out the owner and timestamps", () => {
    const row: SessionRow = {
      id: "s1",
      user_id: "u1",
      session_date: "2026-11-05",
      focus: "acceleration",
      surface: "track",
      rpe: 8,
      notes: "Windy",
      created_at: "2026-11-05T10:00:00Z",
      updated_at: "2026-11-05T10:00:00Z",
    };

    expect(toSession(row)).toEqual({
      id: "s1",
      sessionDate: "2026-11-05",
      focus: "acceleration",
      surface: "track",
      rpe: 8,
      notes: "Windy",
    });
  });

  test("toRep maps the columns and keeps nulls", () => {
    const row: RepRow = {
      id: "r1",
      session_id: "s1",
      user_id: "u1",
      position: 2,
      distance_m: 60,
      time_s: 7.12,
      timing_method: "electronic",
      start_type: null,
      max_effort: false,
      note: null,
      created_at: "2026-11-05T10:00:00Z",
    };

    expect(toRep(row)).toEqual({
      id: "r1",
      sessionId: "s1",
      position: 2,
      distanceM: 60,
      timeS: 7.12,
      timingMethod: "electronic",
      startType: null,
      maxEffort: false,
      note: null,
    });
  });

  test("toPersonalBest maps the view's columns", () => {
    const row: PersonalBestRow = {
      user_id: "u1",
      distance_m: 100,
      timing_method: "hand",
      best_time_s: 11.5,
      rep_id: "r1",
      session_date: "2026-11-05",
    };

    expect(toPersonalBest(row)).toEqual({
      distanceM: 100,
      timingMethod: "hand",
      bestTimeS: 11.5,
      repId: "r1",
      sessionDate: "2026-11-05",
    });
  });
});

describe("app types to rows", () => {
  const session: NewSession = { focus: "race", surface: "indoor", rpe: null, notes: null };

  test("toSessionInsert sets the owner and leaves out a missing date", () => {
    const insert = toSessionInsert(session, "u1");

    expect(insert.user_id).toBe("u1");
    expect(insert).not.toHaveProperty("session_date");
  });

  test("toSessionInsert keeps a date that was given", () => {
    const insert = toSessionInsert({ ...session, sessionDate: "2026-11-01" }, "u1");

    expect(insert.session_date).toBe("2026-11-01");
  });

  test("toRepInserts numbers reps from 1 in array order", () => {
    const inserts = toRepInserts([newRep, { ...newRep, timeS: 11.9 }], "s1", "u1");

    expect(inserts.map((rep) => rep.position)).toEqual([1, 2]);
    expect(inserts.map((rep) => rep.time_s)).toEqual([11.84, 11.9]);
  });

  test("toRepInserts sets the session and owner on every rep", () => {
    const [insert] = toRepInserts([newRep], "s1", "u1");

    expect(insert).toEqual({
      session_id: "s1",
      user_id: "u1",
      position: 1,
      distance_m: 100,
      time_s: 11.84,
      timing_method: "hand",
      start_type: "blocks",
      max_effort: true,
      note: null,
    });
  });
});

describe("validateRep", () => {
  test.each([
    [10, 1.5],
    [100, 11.84],
    [600, 90],
    [100, 0.01],
    [600, 9999.99],
  ])("accepts %d m in %d s", (distanceM, timeS) => {
    expect(validateRep({ distanceM, timeS })).toBeNull();
  });

  test.each([9, 601, 0, -100, 100.5, NaN])("rejects a distance of %d", (distanceM) => {
    expect(validateRep({ distanceM, timeS: 11.84 })).toMatch(/Distance/);
  });

  test.each([0, -1, 10000, NaN, Infinity])("rejects a time of %d", (timeS) => {
    expect(validateRep({ distanceM: 100, timeS })).toMatch(/above 0/);
  });

  test("rejects more than two decimals, which the database would round to nearest", () => {
    expect(validateRep({ distanceM: 100, timeS: 10.843 })).toMatch(/two decimal/);
  });

  test("accepts every hundredth up to 60 seconds, despite float noise", () => {
    for (let hundredths = 1; hundredths <= 6000; hundredths += 1) {
      expect(validateRep({ distanceM: 100, timeS: hundredths / 100 })).toBeNull();
    }
  });
});
