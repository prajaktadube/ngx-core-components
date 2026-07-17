/**
 * ngx-core-components — Tailwind CSS Theme Preset
 *
 * Mapped to CSS custom properties to sync library design tokens (colors, spacing, shadows, radius)
 * with the consumer's corporate Tailwind layout system.
 *
 * Usage:
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [
 *       require('ngx-core-components/themes/tailwind-preset')
 *     ],
 *     // ...
 *   }
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ngx: {
          primary: 'var(--ngx-color-primary)',
          'primary-hover': 'var(--ngx-color-primary-hover)',
          'primary-light': 'var(--ngx-color-primary-light)',
          secondary: 'var(--ngx-color-secondary)',
          success: 'var(--ngx-color-success)',
          warning: 'var(--ngx-color-warning)',
          danger: 'var(--ngx-color-danger)',
          info: 'var(--ngx-color-info)',
          surface: 'var(--ngx-color-surface)',
          'surface-alt': 'var(--ngx-color-surface-alt)',
          border: 'var(--ngx-color-border)',
          text: 'var(--ngx-color-text)',
          'text-secondary': 'var(--ngx-color-text-secondary)',
          'text-disabled': 'var(--ngx-color-text-disabled)',
          'text-inverse': 'var(--ngx-color-text-inverse)',
        }
      },
      spacing: {
        'ngx-xs': 'var(--ngx-space-xs)',
        'ngx-sm': 'var(--ngx-space-sm)',
        'ngx-md': 'var(--ngx-space-md)',
        'ngx-lg': 'var(--ngx-space-lg)',
        'ngx-xl': 'var(--ngx-space-xl)',
        'ngx-2xl': 'var(--ngx-space-2xl)',
      },
      borderRadius: {
        'ngx-sm': 'var(--ngx-radius-sm)',
        'ngx-md': 'var(--ngx-radius-md)',
        'ngx-lg': 'var(--ngx-radius-lg)',
        'ngx-xl': 'var(--ngx-radius-xl)',
      },
      boxShadow: {
        'ngx-sm': 'var(--ngx-shadow-sm)',
        'ngx-md': 'var(--ngx-shadow-md)',
        'ngx-lg': 'var(--ngx-shadow-lg)',
        'ngx-xl': 'var(--ngx-shadow-xl)',
      },
      fontFamily: {
        ngx: ['var(--ngx-font-family)', 'sans-serif'],
      }
    }
  }
};
