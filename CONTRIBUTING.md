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

## 📬 Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names like `feat/chart-hover` or `fix/tabs-focus`.
2. **Commit Messages**: Follow standard conventional commits format (e.g. `feat: add radial bar gradients`, `fix: correct gauge dial rotation`).
3. **Checklist**:
   - Verify that `npm run build` succeeds completely.
   - Verify that `npm test` runs with 100% success.
   - Check styling compatibility with light/dark theme CSS tokens.
   - Verify keyboard focus accessibility visual rings.
