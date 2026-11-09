import { errorMessage } from "../errors";

describe("errorMessage", () => {
  test.each([
    ["invalid_credentials", /email or password/],
    ["user_already_exists", /already exists/],
    ["email_exists", /already exists/],
    ["email_address_invalid", /email address/],
    ["email_not_confirmed", /Confirm your email/],
    ["weak_password", /too weak/],
    ["over_request_rate_limit", /Too many attempts/],
    ["23505", /username is taken/],
  ])("explains code %s", (code, expected) => {
    expect(errorMessage({ code })).toMatch(expected);
  });

  test("explains a failed connection from Supabase Auth", () => {
    expect(errorMessage({ name: "AuthRetryableFetchError" })).toMatch(/connection/);
  });

  test("explains a failed connection from fetch", () => {
    expect(errorMessage(new TypeError("Network request failed"))).toMatch(/connection/);
  });

  test.each([{ code: "something_new" }, new Error("boom"), "boom", null, undefined])(
    "falls back to a general message for %j",
    (error) => {
      expect(errorMessage(error)).toBe("Something went wrong. Please try again.");
    },
  );

  test("doesn't treat inherited object properties as codes", () => {
    expect(errorMessage({ code: "constructor" })).toBe("Something went wrong. Please try again.");
  });
});
