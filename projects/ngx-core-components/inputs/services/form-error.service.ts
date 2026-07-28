import { Injectable, InjectionToken } from '@angular/core';

export interface FormErrorMessages {
  required?: string;
  email?: string;
  minlength?: (err: { requiredLength: number; actualLength: number }) => string;
  maxlength?: (err: { requiredLength: number; actualLength: number }) => string;
  min?: (err: { min: number; actual: number }) => string;
  max?: (err: { max: number; actual: number }) => string;
  pattern?: string;
  [key: string]: unknown;
}

export const DEFAULT_FORM_ERROR_MESSAGES: FormErrorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minlength: (err) => `Minimum ${err.requiredLength} characters required`,
  maxlength: (err) => `Maximum ${err.requiredLength} characters allowed`,
  min: (err) => `Value must be at least ${err.min}`,
  max: (err) => `Value must not exceed ${err.max}`,
  pattern: 'Invalid format',
};

export const NGX_FORM_ERROR_MESSAGES = new InjectionToken<FormErrorMessages>('NGX_FORM_ERROR_MESSAGES', {
  providedIn: 'root',
  factory: () => DEFAULT_FORM_ERROR_MESSAGES,
});

@Injectable({ providedIn: 'root' })
export class NgxFormErrorService {
  private messages = DEFAULT_FORM_ERROR_MESSAGES;

  setMessageTemplates(customMessages: Partial<FormErrorMessages>): void {
    this.messages = { ...this.messages, ...customMessages };
  }

  resolveError(errorKey: string, errorValue: unknown): string {
    const template = this.messages[errorKey];
    if (typeof template === 'function') {
      return template(errorValue as any);
    }
    if (typeof template === 'string') {
      return template;
    }
    if (typeof errorValue === 'string') {
      return errorValue;
    }
    return `Invalid value (${errorKey})`;
  }
}
