import { formatTime, parseTime } from "../times";

describe("formatTime", () => {
  it("formats sub-minute times with two decimals", () => {
    expect(formatTime(11.84)).toBe("11.85");
    expect(formatTime(9.5)).toBe("9.50");
  });

  it("formats times over a minute as minutes and seconds", () => {
    expect(formatTime(62.31)).toBe("1:02.31");
    expect(formatTime(125)).toBe("2:05.00");
  });

  it("formats zero", () => {
    expect(formatTime(0)).toBe("0.00");
  });

  it("formats exactly sixty seconds as one minute", () => {
    expect(formatTime(60)).toBe("1:00.00");
  });

  it("carries into the minute when rounding up reaches sixty", () => {
    expect(formatTime(59.999)).toBe("1:00.00");
  });

  it("rounds three decimal times up to the next hundredth", () => {
    expect(formatTime(10.843)).toBe("10.85");
    expect(formatTime(10.841)).toBe("10.85");
  });

  it("returns an empty string for negative or invalid numbers", () => {
    expect(formatTime(-1)).toBe("");
    expect(formatTime(NaN)).toBe("");
    expect(formatTime(Infinity)).toBe("");
  });

  it("does not change any time already stored to the hundredth", () => {
    for (let hundredths = 0; hundredths <= 6000; hundredths++) {
      const expected = (hundredths / 100).toFixed(2);
      const formatted = formatTime(hundredths / 100);
      if (hundredths < 6000) {
        expect(formatted).toBe(expected);
      } else {
        expect(formatted).toBe("1:00.00");
      }
    }
  });
});

describe("parseTime", () => {
  it("parses sub-minute times", () => {
    expect(parseTime("11.84")).toBe(11.84);
    expect(parseTime("11.8")).toBe(11.8);
  });

  it("parses whole seconds", () => {
    expect(parseTime("12")).toBe(12);
  });

  it("parses minutes and seconds", () => {
    expect(parseTime("1:02.31")).toBe(62.31);
    expect(parseTime("1:00")).toBe(60);
  });

  it("parses zero", () => {
    expect(parseTime("0")).toBe(0);
  });

  it("ignores spaces around the time", () => {
    expect(parseTime(" 11.84 ")).toBe(11.84);
  });

  it("rounds three decimal times up to the next hundredth", () => {
    expect(parseTime("10.843")).toBe(10.85);
    expect(parseTime("10.841")).toBe(10.85);
    expect(parseTime("1:02.311")).toBe(62.32);
  });

  it("keeps a three decimal time that is already an exact hundredth", () => {
    expect(parseTime("10.840")).toBe(10.84);
  });

  it("carries into the next second when rounding up", () => {
    expect(parseTime("59.999")).toBe(60);
  });

  it("returns null for empty text", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime("   ")).toBeNull();
  });

  it("returns null for letters", () => {
    expect(parseTime("abc")).toBeNull();
    expect(parseTime("11.8s")).toBeNull();
  });

  it("returns null for negative times", () => {
    expect(parseTime("-5")).toBeNull();
    expect(parseTime("-1:02.31")).toBeNull();
  });

  it("returns null when the seconds part is sixty or more", () => {
    expect(parseTime("1:75.00")).toBeNull();
    expect(parseTime("1:60")).toBeNull();
  });

  it("returns null for badly shaped times", () => {
    expect(parseTime("1:2.31")).toBeNull();
    expect(parseTime("12.")).toBeNull();
    expect(parseTime(".5")).toBeNull();
    expect(parseTime("1:02:03")).toBeNull();
  });

  it("gives back the same time when formatted and parsed again", () => {
    for (let hundredths = 0; hundredths <= 12000; hundredths++) {
      const seconds = hundredths / 100;
      expect(parseTime(formatTime(seconds))).toBe(seconds);
    }
  });
});
