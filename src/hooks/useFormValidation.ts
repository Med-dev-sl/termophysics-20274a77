import { useState, useCallback, useMemo } from "react";

// Common email domains for basic existence check
const VALID_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
  "msn.com", "aol.com", "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me", "zoho.com", "yandex.com", "mail.com",
  "gmx.com", "gmx.net", "fastmail.com", "tutanota.com", "hey.com",
  "pm.me", "yahoo.co.uk", "yahoo.co.in", "outlook.co.uk",
  "hotmail.co.uk", "mail.ru", "inbox.com", "email.com",
  // Educational
  "edu", "ac.uk", "edu.au", "edu.ng", "edu.gh", "edu.za",
  "edu.in", "edu.pk", "edu.ph", "edu.my", "edu.sg",
  // Country-specific
  "co.uk", "com.au", "co.za", "co.in", "co.ng",
];

export interface EmailValidation {
  isValid: boolean;
  message: string;
  status: "idle" | "valid" | "invalid";
}

export interface PasswordValidation {
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isDomainLikelyValid(domain: string): boolean {
  // Check exact match
  if (VALID_EMAIL_DOMAINS.includes(domain)) return true;
  // Check if TLD or subdomain matches known patterns
  const parts = domain.split(".");
  const tld = parts.slice(-1)[0];
  const sld = parts.slice(-2).join(".");
  if (VALID_EMAIL_DOMAINS.includes(sld)) return true;
  // Accept common TLDs (most real domains)
  const validTLDs = ["com", "org", "net", "edu", "gov", "io", "co", "us", "uk", "ca", "au", "de", "fr", "es", "it", "nl", "se", "no", "fi", "dk", "pt", "pl", "cz", "ru", "jp", "cn", "kr", "in", "br", "mx", "za", "ng", "gh", "ke", "eg", "sl"];
  if (validTLDs.includes(tld)) return true;
  return false;
}

export function useEmailValidation() {
  const [emailTouched, setEmailTouched] = useState(false);

  const validateEmail = useCallback((email: string): EmailValidation => {
    if (!email || !emailTouched) {
      return { isValid: false, message: "", status: "idle" };
    }

    if (!email.includes("@")) {
      return { isValid: false, message: "Enter a valid email (e.g., you@gmail.com)", status: "invalid" };
    }

    if (!EMAIL_REGEX.test(email)) {
      return { isValid: false, message: "Invalid email format. Check for typos.", status: "invalid" };
    }

    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || !isDomainLikelyValid(domain)) {
      return { isValid: false, message: `"${domain}" doesn't look like a valid email provider. Use Gmail, Yahoo, Outlook, etc.`, status: "invalid" };
    }

    return { isValid: true, message: "Email looks good! ✓", status: "valid" };
  }, [emailTouched]);

  return { validateEmail, emailTouched, setEmailTouched };
}

export function usePasswordValidation() {
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validatePassword = useCallback((password: string): PasswordValidation => {
    return {
      hasMinLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      isValid: password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password),
    };
  }, []);

  return { validatePassword, passwordTouched, setPasswordTouched };
}
