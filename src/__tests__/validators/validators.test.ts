/**
 * Validator Unit Tests
 * Tests all validation helper functions from src/validators/index.ts
 */
import { describe, test, expect } from 'vitest';
import { validators, composeValidators } from '../../validators';

describe('validators.required', () => {
  test('TC-VAL-001: returns true for non-empty string', () => {
    expect(validators.required('hello')).toBe(true);
  });

  test('TC-VAL-002: returns error message for empty string', () => {
    expect(validators.required('')).not.toBe(true);
  });

  test('TC-VAL-003: returns error message for whitespace-only string', () => {
    expect(validators.required('   ')).not.toBe(true);
  });
});

describe('validators.email', () => {
  test('TC-VAL-004: valid email returns true', () => {
    expect(validators.email('user@boutique.com')).toBe(true);
  });

  test('TC-VAL-005: email without @ returns error', () => {
    expect(validators.email('notanemail')).not.toBe(true);
  });

  test('TC-VAL-006: email without TLD returns error', () => {
    expect(validators.email('user@boutique')).not.toBe(true);
  });

  test('TC-VAL-007: email with spaces returns error', () => {
    expect(validators.email('user @boutique.com')).not.toBe(true);
  });
});

describe('validators.phone', () => {
  test('TC-VAL-008: valid 10-digit Indian mobile (starting 9) returns true', () => {
    expect(validators.phone('9876543210')).toBe(true);
  });

  test('TC-VAL-009: valid 10-digit Indian mobile (starting 6) returns true', () => {
    expect(validators.phone('6789012345')).toBe(true);
  });

  test('TC-VAL-010: phone starting with 5 returns error', () => {
    expect(validators.phone('5876543210')).not.toBe(true);
  });

  test('TC-VAL-011: phone shorter than 10 digits returns error', () => {
    expect(validators.phone('987654321')).not.toBe(true);
  });

  test('TC-VAL-012: phone with spaces is handled correctly', () => {
    // spaces are stripped
    expect(validators.phone('98765 43210')).toBe(true);
  });
});

describe('validators.minLength', () => {
  test('TC-VAL-013: returns true when value meets minimum length', () => {
    expect(validators.minLength(5)('hello')).toBe(true);
  });

  test('TC-VAL-014: returns error when value is too short', () => {
    expect(validators.minLength(10)('hi')).not.toBe(true);
  });
});

describe('validators.maxLength', () => {
  test('TC-VAL-015: returns true when value is within max length', () => {
    expect(validators.maxLength(100)('short string')).toBe(true);
  });

  test('TC-VAL-016: returns error when value exceeds max length', () => {
    expect(validators.maxLength(5)('toolong')).not.toBe(true);
  });
});

describe('validators.positiveNumber', () => {
  test('TC-VAL-017: positive number returns true', () => {
    expect(validators.positiveNumber('100')).toBe(true);
  });

  test('TC-VAL-018: zero returns error', () => {
    expect(validators.positiveNumber('0')).not.toBe(true);
  });

  test('TC-VAL-019: negative number returns error', () => {
    expect(validators.positiveNumber('-5')).not.toBe(true);
  });
});

describe('validators.nonNegativeNumber', () => {
  test('TC-VAL-020: zero returns true', () => {
    expect(validators.nonNegativeNumber('0')).toBe(true);
  });

  test('TC-VAL-021: positive number returns true', () => {
    expect(validators.nonNegativeNumber('10')).toBe(true);
  });

  test('TC-VAL-022: negative number returns error', () => {
    expect(validators.nonNegativeNumber('-1')).not.toBe(true);
  });
});

describe('validators.pincode', () => {
  test('TC-VAL-023: valid 6-digit pin returns true', () => {
    expect(validators.pincode('400001')).toBe(true);
  });

  test('TC-VAL-024: pin starting with 0 returns error', () => {
    expect(validators.pincode('012345')).not.toBe(true);
  });

  test('TC-VAL-025: 5-digit pin returns error', () => {
    expect(validators.pincode('40000')).not.toBe(true);
  });
});

describe('validators.gst', () => {
  test('TC-VAL-026: valid GST number returns true', () => {
    expect(validators.gst('29ABCDE1234F1Z5')).toBe(true);
  });

  test('TC-VAL-027: invalid GST format returns error', () => {
    expect(validators.gst('INVALID-GST')).not.toBe(true);
  });
});

describe('validators.pan', () => {
  test('TC-VAL-028: valid PAN returns true', () => {
    expect(validators.pan('ABCDE1234F')).toBe(true);
  });

  test('TC-VAL-029: lowercase PAN returns error', () => {
    expect(validators.pan('abcde1234f')).not.toBe(true);
  });

  test('TC-VAL-030: short PAN returns error', () => {
    expect(validators.pan('ABCDE123')).not.toBe(true);
  });
});

describe('composeValidators', () => {
  test('TC-VAL-031: returns true when all validators pass', () => {
    const result = composeValidators(
      'test@example.com',
      validators.required,
      validators.email
    );
    expect(result).toBe(true);
  });

  test('TC-VAL-032: returns first error message when one validator fails', () => {
    const result = composeValidators(
      '',
      validators.required,
      validators.email
    );
    expect(typeof result).toBe('string');
    expect(result).toContain('required');
  });

  test('TC-VAL-033: stops at first failing validator', () => {
    const result = composeValidators(
      '  ', // whitespace — fails required
      validators.required,
      validators.email
    );
    // Should return required error, not email error
    expect(result).toContain('required');
  });
});
