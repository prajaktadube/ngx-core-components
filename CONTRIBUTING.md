# Contributing to ngx-core-components

Thank you for your interest in contributing to `ngx-core-components`! We want to make contributing to this project as easy and transparent as possible.

---

## 🛠️ Local Environment Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed on your system.

### 2. Clone and Install
Clone the repository and install the Node package dependencies:
```bash
git clone https://github.com/prajaktadube/ngx-core-components.git
cd ngx-core-components
npm install
```

---

## 💻 Running the Project

### Start Live Demo Server
To serve the interactive demo app locally for testing your changes:
```bash
npm start
```
This runs `ng serve` and makes the application available at `http://localhost:4200/`.

### Watch Build Loop
To compile the library in watch mode so that the demo automatically updates as you make changes to library source code:
```bash
npm run watch
```

---

## 🧪 Testing and Verification

### Run Jasmine Unit Tests
We use **Karma** and **Jasmine** for unit testing. Verify that all specs pass before submitting a Pull Request:
```bash
npm test
```
To run tests in headless mode (perfect for CI or local terminal-only verification):
```bash
npx ng test demo --watch=false --browsers=ChromeHeadless
```

### Production Package Compilation
To compile the production build for publishing or release verification:
```bash
npm run build
```

---

## 📐 Component Design & Architecture Conventions

When adding or modifying components, please adhere to our strict design standards:

1. **Signals-First**: Use the signals API for reactive programming. Use `input()` instead of `@Input()`, `output()` instead of `@Output()`, and `model()` for two-way bindings.
2. **OnPush Change Detection**: Always use `changeDetection: ChangeDetectionStrategy.OnPush` in component decorators to ensure high performance and zoneless support.
3. **No Direct DOM Access**: Do not reference `document` or `window` globally. Wrap browser-specific code in `afterNextRender()` or inject `PLATFORM_ID` to support Server-Side Rendering (SSR).
4. **Style with CSS Custom Properties**: Scope your component styling with CSS custom properties using the `--ngx-` prefix to allow theme customization. Add fallbacks, e.g. `color: var(--ngx-color-text, #0f172a)`.
5. **Implement Accessibility (a11y)**: Include keyboard navigation and ARIA attributes (`role`, `aria-expanded`, etc.) on all interactive components.
6. **Zero Runtime Dependencies**: Do not introduce third-party libraries. All components must be written natively.

---

## 📬 Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names like `feat/chart-hover` or `fix/tabs-focus`.
2. **Commit Messages**: Follow standard conventional commits format (e.g. `feat: add radial bar gradients`, `fix: correct gauge dial rotation`).
3. **Checklist**:
   - Verify that `npm run build` succeeds completely.
   - Verify that `npm test` runs with 100% success.
   - Check styling compatibility with light/dark theme CSS tokens.
   - Verify keyboard focus accessibility visual rings.

