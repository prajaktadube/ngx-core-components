# Release and migration policy

## Supported Angular versions

The supported Angular range is defined by the library's `@angular/core` peer
dependency in `projects/ngx-core-components/package.json`. Keep that range, the
workspace and library package versions, and both README version statements in
sync. `npm run metadata:check` verifies these values and the documented secondary
entry-point catalog.

## Versioning and compatibility

Releases follow Semantic Versioning:

- **Patch:** backward-compatible fixes with no public API changes.
- **Minor:** backward-compatible features, components, and secondary entry points.
- **Major:** breaking changes to public components, inputs, outputs, exported
  types, providers, or supported Angular versions.

Prefer deprecation before removal when practical. A deprecation must identify the
replacement and the release in which removal is expected. Keep public selectors
and defaults backward-compatible unless the change is documented as breaking.

## Migration notes

Every major release must include an upgrade section in the changelog or release
notes. For each breaking change, document:

1. The affected component, entry point, or API.
2. The old usage and its replacement.
3. Any behavior or Angular-version change consumers need to account for.
4. A migration example when the change requires code updates.

New required translation keys or changes to persisted grid-view schemas are public
API changes and must be called out explicitly.

## Release verification

Run the same checks required by CI before publishing:

```bash
npm ci --legacy-peer-deps
npm run metadata:check
npm run lint
npm run build
npm run size
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
npm run test:lib -- --watch=false --browsers=ChromeHeadless --code-coverage
npm run build-storybook
```

After the build, inspect the package contents from the generated library:

```bash
cd dist/ngx-core-components
npm pack --dry-run
```

Check formatting for changed project source files with Prettier. The CI formatting
step applies to changed source files because the repository still has legacy
formatting debt outside the scope of an individual release.
