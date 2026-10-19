# Feature and Improvement Roadmap

This roadmap turns the project improvement discussion into implementable work. It is
prioritized for a component library: first make release checks trustworthy, then
improve accessibility and correctness, then add larger workflows and developer
experience. It does not promise every item for a particular release.

## P0 — Reliable quality gates

- [x] Run the library unit-test target in CI as well as the demo tests.
- [x] Make formatting failures fail CI instead of ignoring them; until the existing
      formatting baseline is clean, enforce the check on changed project source files.
- [x] Fix the existing lint error that caused the required lint job to fail.
- [x] Measure the demo/library coverage baselines and set thresholds above the
      current demo baseline; continue raising them as coverage grows.
- [x] Cover singular and zero-result navigation search summaries so the demo
      suite continues to pass its configured branch-coverage gate.
- [x] Keep production builds, bundle-size checks, Storybook, and package-content
      validation as required checks.

**Acceptance:** a deliberately failing library test or formatting check on a changed
project source file fails CI; the CI log shows both demo and library test results.
The current whole-repository Prettier baseline has pre-existing failures, so CI
checks changed project source files and a repository-wide gate must wait for a
separately scoped cleanup rather than making all pull requests fail immediately.

## P1 — Accessibility and component correctness

- [ ] Audit interactive components against WCAG 2.2 AA: accessible names, roles,
      states, focus visibility, keyboard operation, and contrast.
- [x] Add keyboard-operable bars, accessible labels, and a data-table alternative
      to the bar chart.
- [x] Make pie slices individually named and keyboard focusable, with focus
      feedback and reduced-motion support.
- [x] Give scatter plots a localized chart summary, keyboard-focusable labelled
      points, focus tooltips, and reduced-motion support.
- [x] Give line-chart points accessible, keyboard-operable names and localize the
      chart summary, point labels, and pie-slice labels.
- [x] Localize and add keyboard/focus support to the shared chart export menu.
- [ ] Apply shared keyboard and screen-reader accessibility patterns to all chart
      types.
- [x] Name row-selection controls, announce selection changes, and add keyboard-
      operable column visibility, pinning, and reordering controls to the grid.
- [ ] Complete grid keyboard navigation and clear focus management for all menus,
      dialogs, and popovers.
- [x] Give the Advanced Filter Builder dialog accessible semantics, keyboard
      focus trapping, Escape dismissal, and trigger focus restoration.
- [x] Localize the Filter Builder's controls, placeholders, operators, and
      accessible action names.
- [x] Apply shared accessible names and focus-triggered tooltips to waterfall
      marks and keyboard activation to treemap marks.
- [x] Apply localized accessible names, keyboard focus, visible focus feedback,
      and focus-triggered tooltips to sunburst slices.
- [x] Make heatmap cells individually labelled, focusable, keyboard-activatable,
      and visible on focus.
- [x] Give bubble-chart points localized names, visible focus feedback, and
      keyboard-focus tooltips.
- [x] Add localized, keyboard-focusable lollipop marks with visible focus
      feedback and focus-triggered tooltips.
- [x] Add localized, keyboard-focusable dumbbell rows with endpoint values,
      visible focus feedback, and focus-triggered tooltips.
- [x] Make range bars keyboard-operable with accessible start/end values,
      visible focus feedback, and activation through the existing output.
- [x] Make pyramid segments keyboard-operable with localized names, visible
      focus feedback, and focus-triggered tooltips.
- [x] Give funnel stages localized accessible names, keyboard focus, visible
      focus feedback, and focus-triggered tooltips.
- [x] Give column-range marks accessible series/category names, endpoint values,
      visible focus feedback, and focus-triggered tooltips.
- [x] Expose all five box-plot summary values and individually name and focus
      outlier marks with visible focus feedback and tooltips.
- [x] Expose bullet-chart actual and target marks with accessible values,
      keyboard focus, and visible focus feedback.
- [x] Give radial progress rings accessible names containing progress and
      actual/target values, plus keyboard focus and focus tooltips.
- [x] Add accessible names and keyboard-focused tooltips to Marimekko segments,
      including their column/category and percentage context.
- [x] Replace treemap and sunburst export dropdowns with the shared localized,
      keyboard-accessible chart export menu.
- [x] Add focused regression tests for bar-chart interactions, form validation,
      RTL date-range navigation, and barcode encoding vectors.
- [x] Replace the barcode renderer's pseudo-patterns with Code 128-B encoding,
      checksum generation, printable-ASCII validation, and accessible errors.
- [x] Verify generated Code 128-B modules with the independent ZXing decoder.

**Acceptance:** automated checks and keyboard/screen-reader-oriented tests cover
representative controls; generated barcodes pass published known vectors and a
decoder check.

## P2 — Data Grid workflows

- [x] Define a typed remote data-source contract for paging, sorting, filtering,
      cancellation, loading, and error states without changing local-data mode.
- [x] Add serializable grid state and saved-view import/export with schema/version
      validation.
- [x] Add column pinning and user-controlled column order/visibility, with
      accessible keyboard controls.
- [x] Test remote loading/errors/stale requests and saved-view round-trips/rejection.
- [x] Test and expose keyboard-accessible column configuration controls.
- [x] Move the grid's component styles into a dedicated stylesheet.
- [x] Keep grid arrow/Tab navigation within its cells, preserve native toolbar
      keys, and restore focus when filter/context popovers close.
- [x] Localize grid toolbar, grouping, filter, export, and row-action labels.
- [ ] Split the large grid component into focused implementation units without
      breaking its public API.

**Acceptance:** local mode remains backward-compatible; remote mode emits typed
state changes and handles errors/cancellation; saved views survive JSON
round-tripping and invalid input is reported.

## P3 — Form Builder workflows

- [x] Support conditional visibility and enablement from typed field dependencies.
- [x] Support asynchronous validators with pending, success, and error states.
- [x] Add multi-step form flows with validation before advancing and a typed result.
- [x] Cover async races and disabled fields in validation.
- [x] Validate missing condition references and dependency cycles; report
      actionable, localized schema errors.

**Acceptance:** a schema can describe a conditional, async-validated, multi-step
form without consumers writing bespoke orchestration code; invalid schemas surface
actionable errors.

## P4 — Localization, RTL, and responsive behavior

- [ ] Complete translation coverage for built-in labels, messages, dates, and
      accessibility text across all entry points.
- [x] Provide nested partial locale overrides with English fallback and tests.
- [x] Support RTL-aware horizontal arrow navigation in the date-range picker and
      visual left/right navigation in the data grid.
- [x] Make Kanban keyboard card movement follow visual left/right directions
      under `dir="rtl"`.
- [x] Make horizontal tab-strip arrow navigation follow visual left/right
      direction under `dir="rtl"`.
- [ ] Extend RTL layout and direction-aware keyboard behavior across applicable
      components.
- [ ] Audit touch targets, overflow, and responsive layouts on narrow screens.

**Acceptance:** a non-English locale and RTL demo exercise common controls, grid,
and dialog flows; built-in text does not unexpectedly fall back to English.

## P5 — Consumer and contributor experience

- [x] Provide a theme-token playground with editable tokens and copyable CSS output.
- [x] Provide a stable component test harness from a public testing entry point.
- [x] Document usage examples for the new chart, grid, form, barcode, i18n, and
      testing APIs.
- [x] Add integration recipes for Reactive Forms, SSR, theming, and tree-shaken
      secondary entry points.
- [x] Keep component lists and supported-version/package metadata synchronized
      across the root README, library README, and package metadata.
- [x] Validate package versions, supported Angular range, and advertised
      secondary-entry-point names/count.
- [x] Keep the component catalogue accurate across the root and library READMEs by
      making the root catalogue canonical and labeling the library list as highlights.

**Acceptance:** examples build in CI, harnesses can be imported from a documented
entry point, and public component/catalogue documentation has one verifiable source
of truth.

## P6 — Maintainability and release readiness

- [x] Raise the CI coverage thresholds above the measured demo baseline.
- [ ] Extract shared chart data interactions and accessibility behavior rather than
      copying them into individual charts. The export menu is shared; data
      interactions remain to be generalized across chart types.
- [x] Extract reusable focus, accessible-name, and keyboard-activation behavior
      for SVG chart marks and adopt it in the line, pie, and scatter charts.
- [x] Document the supported Angular range, migration policy, and breaking-change
      expectations in one release guide.
- [x] Track bundle budgets for every secondary entry point, including newly
      added i18n and testing entry points.

**Acceptance:** recurring library changes have targeted tests, documented public
API effects, and measurable bundle-size feedback.

## Delivery notes

- Changes should preserve the zero-runtime-dependency policy unless maintainers
  explicitly approve an exception.
- Public APIs should remain backward-compatible by default; intentional breaking
  changes require migration notes.
- Each feature should land with focused tests and update the relevant API/demo
  documentation.
