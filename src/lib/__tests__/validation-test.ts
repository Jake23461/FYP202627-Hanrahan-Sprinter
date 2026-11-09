import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../validation";

describe("validateDisplayName", () => {
  test("accepts a name", () => {
    expect(validateDisplayName("Jake Hanrahan")).toBeNull();
  });

  test.each(["", "   "])("rejects %j", (name) => {
    expect(validateDisplayName(name)).toMatch(/name/);
  });
});

describe("validateEmail", () => {
  test.each(["jake@example.com", "a.b+c@club.ie", "  jake@example.com  "])("accepts %j", (email) => {
    expect(validateEmail(email)).toBeNull();
  });

  test.each(["", "jake", "jake@", "@example.com", "jake@example", "ja ke@example.com", "a@b@c.com"])(
    "rejects %j",
    (email) => {
      expect(validateEmail(email)).toMatch(/valid email/);
    },
  );
});

describe("validatePassword", () => {
  test.each(["12345678", "a much longer password"])("accepts %j", (password) => {
    expect(validatePassword(password)).toBeNull();
  });

  test.each(["", "1234567"])("rejects %j", (password) => {
    expect(validatePassword(password)).toMatch(/at least 8/);
  });
});

describe("validateUsername", () => {
  test.each(["abc", "jake_23", "a".repeat(20)])("accepts %j", (username) => {
    expect(validateUsername(username)).toBeNull();
  });

  test.each(["", "ab", "a".repeat(21), "Jake", "jake hanrahan", "jake-23", "jáke"])(
    "rejects %j",
    (username) => {
      expect(validateUsername(username)).toMatch(/3 to 20/);
    },
  );
});
