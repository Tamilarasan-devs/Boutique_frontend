// ─── Validation helpers ──────────────────────────────────────────────────────

export const validators = {
  required: (value: string) =>
    value.trim().length > 0 || 'This field is required.',

  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.',

  phone: (value: string) =>
    /^[6-9]\d{9}$/.test(value.replace(/\s/g, '')) || 'Enter a valid 10-digit Indian mobile number.',

  minLength: (min: number) => (value: string) =>
    value.trim().length >= min || `Minimum ${min} characters required.`,

  maxLength: (max: number) => (value: string) =>
    value.trim().length <= max || `Maximum ${max} characters allowed.`,

  positiveNumber: (value: string) =>
    (Number(value) > 0) || 'Must be a positive number.',

  nonNegativeNumber: (value: string) =>
    (Number(value) >= 0) || 'Must be 0 or greater.',

  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Enter a valid URL.';
    }
  },

  pincode: (value: string) =>
    /^[1-9][0-9]{5}$/.test(value) || 'Enter a valid 6-digit PIN code.',

  gst: (value: string) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value) ||
    'Enter a valid GST number.',

  pan: (value: string) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) || 'Enter a valid PAN number.',
};

// ─── Compose multiple validators ─────────────────────────────────────────────
export function composeValidators(
  value: string,
  ...rules: Array<(v: string) => true | string>
): true | string {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return true;
}