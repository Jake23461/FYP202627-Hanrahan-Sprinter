import { dateParts, isoToDisplay, parseDisplayDate, todayIso, validateSessionDate } from "../dates";

describe("dateParts", () => {
  test.each([
    ["2026-11-09", { weekday: "MON", day: 9, month: "NOV" }],
    ["2026-10-10", { weekday: "SAT", day: 10, month: "OCT" }],
    ["2028-02-29", { weekday: "TUE", day: 29, month: "FEB" }],
    ["2027-01-01", { weekday: "FRI", day: 1, month: "JAN" }],
  ])("splits %s", (iso, expected) => {
    expect(dateParts(iso)).toEqual(expected);
  });
});

describe("todayIso", () => {
  test("uses the local date with leading zeros", () => {
    expect(todayIso(new Date(2026, 0, 5, 9, 0))).toBe("2026-01-05");
  });

  test("stays on the local day just after midnight", () => {
    expect(todayIso(new Date(2026, 6, 1, 0, 30))).toBe("2026-07-01");
  });

  test("stays on the local day just before midnight", () => {
    expect(todayIso(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("isoToDisplay", () => {
  test("turns a stored date into DD/MM/YYYY", () => {
    expect(isoToDisplay("2026-11-09")).toBe("09/11/2026");
  });
});

describe("parseDisplayDate", () => {
  test.each([
    ["09/11/2026", "2026-11-09"],
    ["9/11/2026", "2026-11-09"],
    [" 29/02/2028 ", "2028-02-29"],
  ])("reads %j", (text, expected) => {
    expect(parseDisplayDate(text)).toBe(expected);
  });

  test.each(["", "2026-11-09", "11/2026", "31/02/2026", "29/02/2026", "00/11/2026", "09/13/2026", "9-11-2026"])(
    "rejects %j",
    (text) => {
      expect(parseDisplayDate(text)).toBeNull();
    },
  );

  test("round trips with isoToDisplay", () => {
    expect(parseDisplayDate(isoToDisplay("2026-03-01"))).toBe("2026-03-01");
  });
});

describe("validateSessionDate", () => {
  const today = "2026-11-09";

  test.each(["09/11/2026", "08/11/2026", "01/01/2020"])("accepts %j", (text) => {
    expect(validateSessionDate(text, today)).toBeNull();
  });

  test("rejects a date in the future", () => {
    expect(validateSessionDate("10/11/2026", today)).toMatch(/future/);
  });

  test("rejects a date that can't be read", () => {
    expect(validateSessionDate("31/02/2026", today)).toMatch(/DD\/MM\/YYYY/);
  });
});
