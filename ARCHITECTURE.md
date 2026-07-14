# Architecture Decision Records

> This document explains the key design decisions in `ngx-core-components` and the rationale behind them. It serves as a guide for contributors and helps enterprise teams evaluate the library's architectural fitness.

---

## 1. Signals-First Architecture

**Decision:** All components use Angular's signals API (`input()`, `output()`, `signal()`, `computed()`, `effect()`, `viewChild()`).

**Rationale:**
- Signals are Angular's future — Zone.js is being phased out
- `computed()` replaces most `ngOnChanges` logic with cleaner, declarative reactivity
- `input()` and `output()` provide better type inference than decorators
- Enables zoneless change detection (future-proof)

**Rule:** Never use `@Input()`, `@Output()`, `@ViewChild()` decorators. Always use their signal-based equivalents.

---

## 2. Standalone Components Only

**Decision:** Every component is standalone. No NgModules anywhere.

**Rationale:**
- Standalone components are Angular's recommended pattern since v15
- Simpler mental model — `imports` array on the component itself
- Better tree-shaking — no module-level side effects
- Easier for consumers — import the component directly, no module configuration

**Rule:** Never create an `NgModule`. All components must set `standalone: true`.

---

## 3. OnPush Change Detection (100%)

**Decision:** Every component uses `ChangeDetectionStrategy.OnPush`.

**Rationale:**
- Prevents unnecessary change detection cycles
- Required for zoneless compatibility
- Signals + OnPush is the optimal performance combination
- Forces explicit state management (no relying on Zone.js magic)

**Rule:** Every `@Component` must include `changeDetection: ChangeDetectionStrategy.OnPush`.

---

## 4. Secondary Entry Points (Tree-Shaking)

**Decision:** The library is organized into 12 secondary entry points: `charts`, `inputs`, `grid`, `views`, `buttons`, `dialog`, `feedback`, `layout`, `navigation`, `ai`, `barcodes`, `schematics`.

**Rationale:**
- Consumers only pay (in bundle size) for what they import
- `import { BarChartComponent } from 'ngx-core-components/charts'` only pulls in charts code
- The primary entry point re-exports everything for convenience/backward compatibility
- `sideEffects: false` enables aggressive tree-shaking by bundlers

**Rule:** New components must be placed in the appropriate secondary entry point. New entry points require a `ng-package.json` and `public-api.ts`.

---

## 5. Zero Runtime Dependencies

**Decision:** The library has zero runtime dependencies (only `tslib` which Angular requires).

**Rationale:**
- No version conflicts with consumer apps
- No security vulnerabilities from transitive dependencies
- Smaller bundle size
- Charts use pure SVG — no D3.js dependency
- Barcodes use pure canvas/SVG rendering
- This is a **major differentiator** vs libraries that bundle D3, Chart.js, etc.

**Rule:** Never add a runtime dependency. All functionality must be implemented from scratch or use Angular's built-in capabilities.

---

## 6. CSS Custom Properties for Theming

**Decision:** All components use CSS custom properties (design tokens) for theming, defined in `themes/theme.css`.

**Rationale:**
- CSS custom properties work at runtime — no build step required
- Consumers can override variables in their global styles
- Supports dynamic theme switching (light/dark) without recompilation
- No SCSS/preprocessor lock-in
- Follows the same pattern as Angular Material v3

**Conventions:**
- Global tokens use `--ngx-` prefix (e.g., `--ngx-color-primary`)
- Component-specific tokens use `--ngx-{component}-` prefix (e.g., `--ngx-grid-border`)
- All values include CSS fallbacks: `var(--ngx-color-primary, #4f46e5)`
- Dark mode is activated via `body.dark` or `[data-theme="dark"]` selectors

---

## 7. Inline Component Styles

**Decision:** Component CSS is defined inline in the `styles` array, not in separate `.css` files.

**Rationale:**
- Single-file components are easier to review and maintain
- No file lookup overhead when exploring a component
- Styles are co-located with the template and logic
- Angular's view encapsulation still applies (emulated by default)

**Trade-off:** Large components (e.g., DataGrid at ~4K lines) may benefit from extraction in future refactoring.

---

## 8. ControlValueAccessor on All Form Components

**Decision:** Every input component implements `ControlValueAccessor`.

**Rationale:**
- Works with both Reactive Forms (`formControl`, `formControlName`) and Template-driven Forms (`ngModel`)
- Standard Angular pattern — consumers expect this
- Proper integration with form validation, dirty/touched states, and disabled handling

**Implementation pattern:**
```typescript
providers: [
  { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MyComponent), multi: true }
]
```

---

## 9. Generics for Type Safety

**Decision:** Complex components use TypeScript generics (e.g., `DataGridComponent<T extends object>`).

**Rationale:**
- Provides compile-time type safety for data-bound components
- Column definitions, row click events, and cell templates are all typed against `T`
- Prevents runtime errors from typos in field names
- Better IDE autocomplete for consumers

---

## 10. Lazy-Loaded Demo App

**Decision:** The demo app uses `loadComponent: () => import(...)` for all routes.

**Rationale:**
- Fast initial load — only the shell and current page load initially
- Demonstrates best practices for consumers
- Each demo page is self-contained and independent

---

## Directory Structure

```
projects/ngx-core-components/
├── src/
│   ├── lib/
│   │   ├── tooltip/              ← Primary entry point components
│   │   └── i18n/                 ← Internationalization tokens
│   └── public-api.ts             ← Re-exports all secondary entry points
├── charts/                       ← Secondary entry point
│   ├── ng-package.json
│   ├── public-api.ts
│   ├── bar-chart/
│   ├── line-chart/
│   ├── gantt-chart/
│   └── ... (38 chart components)
├── inputs/                       ← Secondary entry point
├── grid/                         ← Secondary entry point
├── views/                        ← Secondary entry point
├── buttons/                      ← Secondary entry point
├── dialog/                       ← Secondary entry point
├── feedback/                     ← Secondary entry point
├── layout/                       ← Secondary entry point
├── navigation/                   ← Secondary entry point
├── ai/                           ← Secondary entry point
├── barcodes/                     ← Secondary entry point
├── schematics/                   ← ng-add schematic
├── themes/
│   └── theme.css                 ← Design tokens (light + dark)
├── package.json
└── ng-package.json
```

---

## Adding a New Component

1. Choose the correct secondary entry point (or create a new one if justified)
2. Create a directory: `{entry-point}/{component-name}/`
3. Create the component file: `{component-name}.component.ts`
4. Follow these requirements:
   - `standalone: true`
   - `changeDetection: ChangeDetectionStrategy.OnPush`
   - Use `input()`, `output()`, `signal()`, `computed()` — never decorators
   - Use CSS custom properties with `--ngx-` prefix
   - Support dark mode via `body.dark` / `[data-theme="dark"]`
   - Add ARIA attributes and keyboard navigation
   - Implement `ControlValueAccessor` if it's a form control
5. Export from the entry point's `public-api.ts`
6. Re-export from `src/public-api.ts` (primary entry point)
7. Add a demo page in `projects/demo/src/app/pages/`
8. Write unit tests in `{component-name}.component.spec.ts`
