# Changelog

All notable changes to `ngx-core-components` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.20] - 2026-07-15

### Added
- **Storybook**: 100+ interactive component stories with Chromatic visual regression testing
- **DataGrid refactoring**: Extracted models, types, and export service into separate files for maintainability
- **FormDesigner**: New drag-and-drop form builder component with toolbox, canvas, and property inspector
- **AI Chat**: Expanded AI conversation components with history, card carousels, and typing indicators
- **Layout & Overlays**: Enriched Splitter, DashboardLayout, Carousel, Dialog, Popover, Drawer stories
- **Navigation**: Added Breadcrumb, Menu, CommandPalette, ContextMenu, BackToTop stories
- **Accessibility audit**: WCAG 2.1 AA contrast fixes and ARIA improvements across Dropdown, DatePicker, Autocomplete, TabStrip, and Notification components
- **i18n support**: Full internationalization via `NGX_CORE_I18N` injection token with English defaults and `provideNgxI18n()` helper

### Changed
- **DataGrid**: Modularized into `models.ts` and `grid-export.service.ts` (backward compatible)
- **Storybook tsconfig**: Scoped compilation to library source only, excluding spec files

### Fixed
- Acorn indexer parsing warnings in Storybook caused by TypeScript-only syntax in story files
- Calendar disabled state contrast ratios in DatePickerComponent
- Notification container missing `aria-live` and `role` attributes

## [0.3.0] - 2026-06-01

### Added
- Initial public release of 100+ Angular standalone components
- 12 secondary entry points for tree-shakable imports
- CSS custom properties theming system with light/dark mode
- `ng add` and `ng generate grid` schematics
- Karma/Jasmine test suite (159 specs)
- GitHub Pages demo site deployment
- npm auto-publish workflow

---

_For earlier development history, see the [commit log](https://github.com/prajaktadube/ngx-core-components/commits/main)._
