// Formatting and parsing for sprint times. Times are held in seconds.

// Times are recorded to the hundredth, and anything between two hundredths goes
// up to the next one (10.843 becomes 10.85), following World Athletics Technical
// Rule 19.23 for automatic timing. toFixed removes float noise first, otherwise
// a value like 11.84 could become 1184.0000000000002 hundredths and wrongly round
// up to 11.85.
function toHundredths(seconds: number): number {
  return Math.ceil(Number((seconds * 100).toFixed(6)));
}

// 11.84 -> "11.84", 62.31 -> "1:02.31". Returns "" if there is no valid time.
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "";
  }

  const hundredths = toHundredths(seconds);
  const minutes = Math.floor(hundredths / 6000);
  const remainder = ((hundredths % 6000) / 100).toFixed(2);

  if (minutes === 0) {
    return remainder;
  }
  return `${minutes}:${remainder.padStart(5, "0")}`;
}

// "11.84" -> 11.84, "1:02.31" -> 62.31. Returns null if the text isn't a time.
export function parseTime(text: string): number | null {
  const match = /^(?:(\d+):(\d{2}(?:\.\d+)?)|(\d+(?:\.\d+)?))$/.exec(text.trim());
  if (!match) {
    return null;
  }

  const [, minutes, secondsAfterMinutes, secondsOnly] = match;
  if (secondsOnly !== undefined) {
    return toHundredths(Number(secondsOnly)) / 100;
  }

  const seconds = Number(secondsAfterMinutes);
  if (seconds >= 60) {
    return null;
  }
  return toHundredths(Number(minutes) * 60 + seconds) / 100;
}
