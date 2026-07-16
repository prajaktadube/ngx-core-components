# Changelog

All notable changes to `ngx-core-components` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.22] - 2026-07-16

### Added
- **API Reference**: Setup material-themed API docs using Compodoc with auto-deploy on GitHub Pages.
- **Developer Experience**: Added rich JSDoc inline IDE documentation to `DataGrid` and `FormBuilder` inputs/outputs.
- **Accessibility**: Added global `prefers-reduced-motion` and `forced-colors` high-contrast CSS overrides in `theme.css`.

### Fixed
- **CI/CD Hardening**: Resolved peer-dependency conflicts with `--legacy-peer-deps` flags across all workflows.
- **SSR Compatibility**: Wrapped `window` and `document` references in `BackToTopComponent` to prevent SSR/pre-render failures.

## [0.3.21] - 2026-07-14

### Added
- **VirtualListComponent**: Shipped high-performance list virtualization support with dynamic item templates, click event bindings, and viewport window mapping.
- **Internationalization (i18n)**: Shipped full internationalization support via `NGX_CORE_I18N` token and `provideNgxI18n()` configuration helper.

## [0.3.20] - 2026-06-29

### Added
- **Calendar**: Enhanced calendar component with range selection and month/year picker views.

## [0.3.19] - 2026-06-07

### Added
- **UI Enhancements**: Enhanced global component layout responsiveness and optimized in-app search functionality.

## [0.3.18] - 2026-06-05

### Added
- **TextBox**: Added built-in validation status indicators (success, error, warning) and refreshed component styling.

## [0.3.17] - 2026-06-05

### Added
- **Performance**: Integrated `size-limit` bundle tracking to monitor compile assets weight.

## [0.3.15] - 2026-06-03

### Added
- **Charts**: Enhanced visual styling, layouts, and interactivity controls across SVG charting components.

## [0.3.14] - 2026-06-01

### Added
- **New Chart Types**: Added Waterfall, Radial Bar, and Candlestick chart components.
- **Pie Chart**: Added export to CSV/PDF/Image functionality.
