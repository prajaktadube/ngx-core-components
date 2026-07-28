/**
 * Pure pattern masking utility functions.
 * Built-in presets: 'phone', 'ssn', 'credit-card', 'date-iso', or custom pattern string (e.g., '(###) ###-####')
 * Tokens:
 * '#' = digit (0-9)
 * 'A' = uppercase letter (A-Z)
 * 'a' = lowercase letter (a-z)
 * '*' = alphanumeric (0-9, A-Z, a-z)
 */

export interface MaskResult {
  masked: string;
  unmasked: string;
}

export function getPresetMask(preset: string): string {
  switch (preset.toLowerCase()) {
    case 'phone':
    case 'us-phone':
      return '(###) ###-####';
    case 'ssn':
      return '###-##-####';
    case 'credit-card':
    case 'card':
      return '#### #### #### ####';
    case 'date':
      return '##/##/####';
    case 'time':
      return '##:##';
    case 'zip':
    case 'zipcode':
      return '#####-####';
    default:
      return preset; // custom pattern
  }
}

export function applyMask(value: string, pattern: string): MaskResult {
  if (!value || !pattern) return { masked: value || '', unmasked: value || '' };

  const maskPattern = getPresetMask(pattern);
  let masked = '';
  let unmasked = '';
  let valIdx = 0;

  for (let pIdx = 0; pIdx < maskPattern.length && valIdx < value.length; pIdx++) {
    const pChar = maskPattern[pIdx];
    const vChar = value[valIdx];

    if (pChar === '#') {
      if (/\d/.test(vChar)) {
        masked += vChar;
        unmasked += vChar;
        valIdx++;
      } else {
        valIdx++; // skip non-matching char
        pIdx--;   // stay on pattern char
      }
    } else if (pChar === 'A') {
      if (/[a-zA-Z]/.test(vChar)) {
        const upper = vChar.toUpperCase();
        masked += upper;
        unmasked += upper;
        valIdx++;
      } else {
        valIdx++;
        pIdx--;
      }
    } else if (pChar === 'a') {
      if (/[a-zA-Z]/.test(vChar)) {
        const lower = vChar.toLowerCase();
        masked += lower;
        unmasked += lower;
        valIdx++;
      } else {
        valIdx++;
        pIdx--;
      }
    } else if (pChar === '*') {
      if (/[a-zA-Z0-9]/.test(vChar)) {
        masked += vChar;
        unmasked += vChar;
        valIdx++;
      } else {
        valIdx++;
        pIdx--;
      }
    } else {
      // Literal delimiter char
      masked += pChar;
      if (vChar === pChar) {
        valIdx++;
      }
    }
  }

  return { masked, unmasked };
}

export function unmaskValue(value: string, pattern: string): string {
  return applyMask(value, pattern).unmasked;
}
