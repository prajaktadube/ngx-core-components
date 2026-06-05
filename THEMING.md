# Theme Customization Guide

`ngx-core-components` is designed to be highly customizable. By utilizing CSS custom properties (variables), you can align all component styles, colors, and charts to match your brand design system out of the box.

---

## 🎨 1. Core Styling Variables

To customize the default styling, override the following properties in your global stylesheet (e.g., `styles.scss` or `styles.css`):

```css
:root {
  /* Brand Accent Colors */
  --primary-color: #4f46e5;       /* Primary Indigo */
  --primary-hover: #4338ca;
  --secondary-color: #10b981;     /* Success Green */
  
  /* Text System Colors */
  --ngx-chart-text: #0f172a;      /* Slate 900 */
  --ngx-chart-axis-text: #64748b; /* Slate 500 */
  
  /* Canvas Background & Layouts */
  --ngx-chart-bg: #ffffff;
  --ngx-chart-grid: #ebedf0;      /* Grid lines color */
  --ngx-chart-axis: #ced4da;      /* Base axis lines */
  
  /* Glassmorphic Tooltips */
  --ngx-chart-tooltip-bg: rgba(15, 23, 42, 0.92);
  --ngx-chart-tooltip-color: #f8fafc;
}
```

---

## 🌓 2. Supporting Dark Mode

To switch variables dynamically when your app enters Dark Mode (e.g. by applying a `.dark` class to the `<body>` or `<html>` tag), define the overrides as follows:

```css
body.dark {
  /* Dark Canvas Base */
  --ngx-chart-bg: #0f172a;        /* Slate 900 */
  --ngx-chart-grid: rgba(255, 255, 255, 0.08);
  --ngx-chart-axis: rgba(255, 255, 255, 0.15);
  
  /* Text Overrides */
  --ngx-chart-text: #f8fafc;      /* Slate 50 */
  --ngx-chart-axis-text: #94a3b8; /* Slate 400 */
  
  /* Tooltip Adjustments */
  --ngx-chart-tooltip-bg: rgba(15, 23, 42, 0.96);
  --ngx-chart-tooltip-color: #f8fafc;
}
```

---

## 📊 3. Chart Component Specific Variables

Each chart also has specific hover highlight configuration tokens:

- `--ngx-chart-hover-stroke`: Highlights selected grid cells or chart nodes (defaults to `#0f172a` in light theme, or `#ffffff` in dark).
- `--ngx-chart-hover-bg`: Highlight overlays for columns and bars.
- `--ngx-chart-tooltip-bg`: Frosted glass background blurs.
