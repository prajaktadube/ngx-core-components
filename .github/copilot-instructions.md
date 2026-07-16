# ngx-core-components — AI Coding Copilot Instructions

This guide provides context and constraints for AI coding agents and Copilots (like GitHub Copilot, Cursor, etc.) working on the `ngx-core-components` library repository.

---

## 🛠️ Quick CLI Commands
- **Start Demo App**: `npm start` (serves `projects/demo` via `ng serve` at `http://localhost:4200/`).
- **Run Unit Tests**: `npm test` (Karma + Jasmine with coverage generation enabled).
- **Run ESLint Checks**: `npm run lint` (runs Angular ESLint rules).
- **Run Prettier Check**: `npm run format:check` (checks codebase formatting).
- **Build API Docs**: `npm run docs` (compiles Compodoc reference output in `dist/demo/browser/docs`).
- **Build Library**: `npm run build` (builds library and demo application outputs under `dist/`).
- **Watch Library Build**: `npm run watch` (incremental build tracking).

---

## 📁 Key File Locations
- **Library Source**: `projects/ngx-core-components/src/`
  - Public Exports: `projects/ngx-core-components/public-api.ts`
  - Theming Stylesheet: `projects/ngx-core-components/themes/theme.css`
- **Demo Playground**: `projects/demo/src/`
  - Interactive Examples: `projects/demo/src/app/`
- **Storybook Stories**: Located side-by-side with components in `projects/ngx-core-components/` (e.g. `*.component.stories.ts`).

---

## 📐 Architecture & Conventions
1. **Standalone Components**: All library components must be standalone (`standalone: true` in `@Component` decorator).
2. **Signals-First Programming**: Use Angular Signals for inputs (`input()`), outputs (`output()`), internal state (`signal()`), and computed derivations (`computed()`) wherever possible. Avoid raw RXJS streams unless handling async event buffering or WebSocket piping.
3. **No External Runtime Dependencies**: Keep the library dependency footprint clean. Only declare peer dependencies on `@angular/core` and `@angular/common`.
4. **SSR (Server-Side Rendering) Safety**: Wrap any direct accesses to browser APIs (`window`, `document`, `localStorage`) inside browser checks (e.g., `typeof window !== 'undefined'`) or execute them inside browser-only hooks to prevent node execution failure during pre-rendering.
5. **Permissive Styling**: Use vanilla CSS variables (design tokens declared in `theme.css`) for layout, colors, and shadows. Do not write rigid pixel definitions or custom inline overrides that prevent consumer customization.

---

## 🧪 Testing & Quality Gates
- **Code Coverage**: We enforce code coverage thresholds configured in `karma.conf.js` (statements: 25%, lines: 30%). Always run `npm test` after adding logic to verify code coverage does not regress.
- **Continuous Integration (CI)**: Pull Requests run a rigorous lint, formatting check, unit test coverage check, storybook compile check, and package packaging audit (`npm pack --dry-run`). Ensure your changes pass local checks before pushing to remote.
