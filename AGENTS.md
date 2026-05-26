# AGENTS — Repo Guidance for AI Coding Agents

Purpose: quick, actionable instructions so an AI agent can be productive in this workspace.

1) Quick commands
- Start demo app: `npm start` (runs `ng serve` — serves `projects/demo`).
- Run tests: `npm test` (Karma + Jasmine configured for both library and demo).
- Build library: `npm run build` (calls `ng build` which builds the `ngx-core-components` library via ng-packagr).
- Watch builds: `npm run watch` (incremental dev builds).

2) Key locations
- Demo app: `projects/demo` — served by `ng serve` and contains interactive examples.
- Library source: `projects/ngx-core-components/src` — public exports in `projects/ngx-core-components/public-api.ts`.
- Workspace config: `angular.json` — build/serve/test targets and architect settings.

3) Conventions & notes for agents
- Use `npm` scripts from the workspace root (package.json). Prefer `ng` targets defined in `angular.json` when needing per-project builds.
- Tests run with Karma; CI may rely on ChromeHeadless. Don't change CI-related configs without checking `karma.conf.js` or existing CI scripts.
- The library is packaged with `ng-packagr` entrypoints under each subpackage (see `ng-package.json` files).
- Keep changes minimal and localized. Follow existing export and public-api patterns when adding new public symbols.

4) Useful links
- Project README: see [README.md](README.md)
- Package manifest: [package.json](package.json)

If you want, I can also add a short `.github/copilot-instructions.md` or create a small skill for release and CI workflows — tell me which next.
