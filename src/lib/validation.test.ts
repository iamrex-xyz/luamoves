import { describe, it, expect } from "vitest";
import {
  validatePhone,
  validateEmail,
  validatePostcode,
  validateAddressPostcode,
  isSameAddress,
  extractAddressParts,
  cleanPhone,
  cleanEmail,
} from "./validation";

describe("validatePhone", () => {
  it("accepts valid Dutch mobile numbers", () => {
    expect(validatePhone("0612345678").isValid).toBe(true);
    expect(validatePhone("0687654321").isValid).toBe(true);
  });

  it("accepts valid Dutch landline numbers", () => {
    expect(validatePhone("0201234567").isValid).toBe(true);
    expect(validatePhone("0301234567").isValid).toBe(true);
  });

  it("accepts numbers with +31 prefix", () => {
    expect(validatePhone("+31612345678").isValid).toBe(true);
    expect(validatePhone("+31201234567").isValid).toBe(true);
  });

  it("accepts numbers with spaces", () => {
    expect(validatePhone("06 12345678").isValid).toBe(true);
    expect(validatePhone("06 1234 5678").isValid).toBe(true);
  });

  it("accepts empty string", () => {
    expect(validatePhone("").isValid).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(validatePhone("12345").isValid).toBe(false);
    expect(validatePhone("abc").isValid).toBe(false);
    expect(validatePhone("061234567").isValid).toBe(false); // too short
    expect(validatePhone("06123456789").isValid).toBe(false); // too long
  });

  it("returns error message for invalid numbers", () => {
    const result = validatePhone("invalid");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("validateEmail", () => {
  it("accepts valid email addresses", () => {
    expect(validateEmail("test@example.com").isValid).toBe(true);
    expect(validateEmail("user.name@domain.nl").isValid).toBe(true);
    expect(validateEmail("user+tag@example.org").isValid).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    expect(validateEmail("invalid").isValid).toBe(false);
    expect(validateEmail("@example.com").isValid).toBe(false);
    expect(validateEmail("user@").isValid).toBe(false);
    expect(validateEmail("user@.com").isValid).toBe(false);
  });

  it("returns error message for invalid emails", () => {
    const result = validateEmail("invalid");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("validatePostcode", () => {
  it("accepts valid Dutch postcodes", () => {
    expect(validatePostcode("1234AB").isValid).toBe(true);
    expect(validatePostcode("1234 AB").isValid).toBe(true);
    expect(validatePostcode("1234ab").isValid).toBe(true);
    expect(validatePostcode("9999ZZ").isValid).toBe(true);
  });

  it("accepts empty string", () => {
    expect(validatePostcode("").isValid).toBe(true);
  });

  it("rejects invalid postcodes", () => {
    expect(validatePostcode("123AB").isValid).toBe(false); // too few digits
    expect(validatePostcode("12345AB").isValid).toBe(false); // too many digits
    expect(validatePostcode("1234A").isValid).toBe(false); // missing letter
    expect(validatePostcode("1234ABC").isValid).toBe(false); // too many letters
    expect(validatePostcode("ABCD12").isValid).toBe(false); // wrong order
  });

  it("returns error message for invalid postcodes", () => {
    const result = validatePostcode("invalid");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("extractAddressParts", () => {
  it("extracts postcode from address", () => {
    const result = extractAddressParts("Hoofdstraat 123, 1234 AB Amsterdam");
    expect(result.postcode).toBe("1234AB");
  });

  it("extracts house number from address", () => {
    const result = extractAddressParts("Hoofdstraat 123, 1234 AB Amsterdam");
    expect(result.houseNumber).toBe("123");
  });

  it("handles address without postcode", () => {
    const result = extractAddressParts("Hoofdstraat 123");
    expect(result.postcode).toBe("");
    expect(result.houseNumber).toBe("123");
  });

  it("handles empty address", () => {
    const result = extractAddressParts("");
    expect(result.postcode).toBe("");
    expect(result.houseNumber).toBe("");
  });
});

describe("validateAddressPostcode", () => {
  it("accepts address with valid postcode", () => {
    expect(validateAddressPostcode("Hoofdstraat 123, 1234 AB Amsterdam").isValid).toBe(true);
  });

  it("accepts empty address", () => {
    expect(validateAddressPostcode("").isValid).toBe(true);
  });

  it("rejects address without postcode", () => {
    const result = validateAddressPostcode("Hoofdstraat 123, Amsterdam");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("postcode");
  });
});

describe("isSameAddress", () => {
  it("returns true for same address", () => {
    expect(isSameAddress(
      "Hoofdstraat 123, 1234 AB Amsterdam",
      "Hoofdstraat 123, 1234AB Amsterdam"
    )).toBe(true);
  });

  it("returns false for different postcodes", () => {
    expect(isSameAddress(
      "Hoofdstraat 123, 1234 AB Amsterdam",
      "Hoofdstraat 123, 5678 CD Rotterdam"
    )).toBe(false);
  });

  it("returns false for different house numbers", () => {
    expect(isSameAddress(
      "Hoofdstraat 123, 1234 AB Amsterdam",
      "Hoofdstraat 456, 1234 AB Amsterdam"
    )).toBe(false);
  });

  it("returns false when addresses lack full info", () => {
    expect(isSameAddress("Hoofdstraat", "Hoofdstraat")).toBe(false);
  });
});

describe("cleanPhone", () => {
  it("removes spaces from phone number", () => {
    expect(cleanPhone("06 12 34 56 78")).toBe("0612345678");
    expect(cleanPhone("06 1234 5678")).toBe("0612345678");
  });

  it("returns same string if no spaces", () => {
    expect(cleanPhone("0612345678")).toBe("0612345678");
  });
});

describe("cleanEmail", () => {
  it("trims whitespace", () => {
    expect(cleanEmail("  test@example.com  ")).toBe("test@example.com");
  });

  it("converts to lowercase", () => {
    expect(cleanEmail("Test@Example.COM")).toBe("test@example.com");
  });

  it("handles both trim and lowercase", () => {
    expect(cleanEmail("  Test@Example.COM  ")).toBe("test@example.com");
  });
});
