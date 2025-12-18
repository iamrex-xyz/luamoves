import { z } from "zod";

// Dutch phone number validation
export const phoneSchema = z.string()
  .transform(val => val.replace(/\s/g, ''))
  .refine(val => val === '' || /^(\+31|0)[1-9][0-9]{8}$/.test(val), {
    message: "Voer een geldig Nederlands telefoonnummer in (bijv. 0612345678)"
  });

// Email validation
export const emailSchema = z.string()
  .email({ message: "Voer een geldig e-mailadres in" });

// Dutch postcode validation
export const postcodeSchema = z.string()
  .transform(val => val.replace(/\s/g, '').toUpperCase())
  .refine(val => val === '' || /^\d{4}[A-Z]{2}$/.test(val), {
    message: "Voer een geldige postcode in (bijv. 1234 AB)"
  });

// Generic validation result type
export type ValidationResult = {
  isValid: boolean;
  error: string | null;
};

// Generic validator function
export const validate = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): ValidationResult => {
  const result = schema.safeParse(value);
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || "Ongeldige invoer"
    };
  }
  return { isValid: true, error: null };
};

// Convenience validators
export const validatePhone = (value: string): ValidationResult => 
  validate(phoneSchema, value);

export const validateEmail = (value: string): ValidationResult => 
  validate(emailSchema, value);

export const validatePostcode = (value: string): ValidationResult => 
  validate(postcodeSchema, value);

// Helper to extract Dutch address parts
export const extractAddressParts = (address: string) => {
  const postcodeMatch = address.match(/\b(\d{4}\s?[A-Za-z]{2})\b/);
  const houseNumberMatch = address.match(/\b(\d+)\b/);
  return {
    postcode: postcodeMatch ? postcodeMatch[1].replace(/\s/g, '').toUpperCase() : '',
    houseNumber: houseNumberMatch ? houseNumberMatch[1] : ''
  };
};

// Validate address contains valid postcode
export const validateAddressPostcode = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: true, error: null };
  }
  const { postcode } = extractAddressParts(address);
  if (!postcode) {
    return {
      isValid: false,
      error: "Adres moet een geldige postcode bevatten (bijv. 1234 AB)"
    };
  }
  return validatePostcode(postcode);
};

// Check if two addresses are the same (based on postcode + house number)
export const isSameAddress = (address1: string, address2: string): boolean => {
  const parts1 = extractAddressParts(address1);
  const parts2 = extractAddressParts(address2);
  if (parts1.postcode && parts2.postcode && parts1.houseNumber && parts2.houseNumber) {
    return parts1.postcode === parts2.postcode && parts1.houseNumber === parts2.houseNumber;
  }
  return false;
};

// Clean phone number (remove spaces)
export const cleanPhone = (phone: string): string => phone.replace(/\s/g, '');

// Clean email (trim and lowercase)
export const cleanEmail = (email: string): string => email.trim().toLowerCase();
