# Theme Customization Guide

`ngx-core-components` is designed to be highly customizable. By utilizing CSS custom properties (design tokens), you can align all component styles, colors, layouts, and charts to match your brand's design system out of the box.

---

## 🎨 1. Core Styling Variables

To customize the default styling, override the following properties in your global stylesheet (e.g., `styles.scss` or `styles.css`):

```css
:root {
  /* Brand Accent Colors */
  --ngx-color-primary: #4f46e5;
  --ngx-color-primary-hover: #4338ca;
  --ngx-color-primary-light: #e0e7ff;
  --ngx-color-secondary: #64748b;
  --ngx-color-success: #10b981;
  --ngx-color-warning: #f59e0b;
  --ngx-color-danger: #ef4444;
  --ngx-color-info: #06b6d4;

  /* Surface & Canvas Layouts */
  --ngx-color-surface: #ffffff;
  --ngx-color-surface-alt: #f8fafc;
  --ngx-color-border: #e2e8f0;
  
  /* Text System Colors */
  --ngx-color-text: #0f172a;
  --ngx-color-text-secondary: #64748b;
  --ngx-color-text-disabled: #94a3b8;
  --ngx-color-text-inverse: #ffffff;
}
```

---

## 🌓 2. Supporting Dark Mode

To switch variables dynamically when your app enters Dark Mode, define the overrides inside `body.dark` or `[data-theme="dark"]` selectors. The library has built-in support for both patterns:

```css
body.dark, [data-theme="dark"] {
  /* Dark Canvas Base */
  --ngx-color-surface: #0f172a;
  --ngx-color-surface-alt: #1e293b;
  --ngx-color-border: #334155;
  
  /* Text Overrides */
  --ngx-color-text: #f8fafc;
  --ngx-color-text-secondary: #94a3b8;
  --ngx-color-text-disabled: #64748b;
  
  /* Chart Customizations */
  --ngx-chart-grid: rgba(255, 255, 255, 0.08);
  --ngx-chart-axis: rgba(255, 255, 255, 0.15);
  
  /* Overlay Backdrop for Dialogs */
  --ngx-dialog-overlay-bg: rgba(0, 0, 0, 0.6);
}
```

---

## 📐 3. Typography & Spacing Scales

You can easily adjust the global density and font styles:

```css
:root {
  /* Typography Scale */
  --ngx-font-family: "Inter", system-ui, sans-serif;
  --ngx-font-size-sm: 0.875rem;
  --ngx-font-size-md: 1rem;
  --ngx-font-weight-medium: 500;

  /* Spacing Scale (Controls paddings & margins) */
  --ngx-space-xs: 0.25rem;
  --ngx-space-sm: 0.5rem;
  --ngx-space-md: 0.75rem;
  --ngx-space-lg: 1rem;
  --ngx-space-xl: 1.5rem;
}
```

---

## 📊 4. Component-Specific Variables

Each component category leverages dedicated variables which inherit from the global brand colors by default. You can override these individually to create custom component variations:

### Input Styling (`ngx-core-components/inputs`)
- `--ngx-input-border`: Color of input borders.
- `--ngx-input-bg`: Background color of inputs.
- `--ngx-input-focus`: Border color on input focus (defaults to primary).
- `--ngx-input-radius`: Border radius for input boxes.
- `--ngx-input-height`: Height of input elements (e.g., `2.5rem`).

### Grid Styling (`ngx-core-components/grid`)
- `--ngx-grid-border`: Color of data grid boundaries.
- `--ngx-grid-header-bg`: Header column background color.
- `--ngx-grid-row-hover`: Background on row hover.
- `--ngx-grid-stripe`: Background overlay for striped rows.

### Button & Dialog Styling
- `--ngx-btn-padding`: Button padding (e.g. `0.5rem 1rem`).
- `--ngx-btn-radius`: Button border radius.
- `--ngx-dialog-overlay-bg`: Dialog modal backdrop overlay color.
- `--ngx-dialog-radius`: Border radius for dialog containers.
- `--ngx-dialog-shadow`: Box shadow applied to dialog panels.

### Charts & Gantt Highlight Tokens
- `--ngx-chart-grid`: Grid line styling in SVG charts.
- `--ngx-chart-axis`: Base axis lines configuration.
- `--ngx-chart-hover-stroke`: Highlights selected cells or nodes.
- `--ngx-chart-hover-bg`: Column highlight overlays.
- `--ngx-chart-tooltip-bg`: Backdrop overlay for interactive tooltips.
- `--ngx-chart-tooltip-color`: Tooltip typography color.

---

## 🔄 5. Backwards Compatibility & Migration

Older versions of `ngx-core-components` relied directly on specific variables like `--primary-color`. In modern versions, these are automatically mapped to the new token system:

```css
--primary-color: var(--ngx-color-primary);
--primary-hover: var(--ngx-color-primary-hover);
--secondary-color: var(--ngx-color-success);
```

Legacy overrides will continue to function seamlessly, but we recommend transitioning to the `--ngx-` prefixed design token variables for consistency.
