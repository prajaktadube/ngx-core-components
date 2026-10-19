import { access, readFile, readdir } from 'node:fs/promises';

const rootPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const libraryPackage = JSON.parse(
  await readFile(new URL('../projects/ngx-core-components/package.json', import.meta.url), 'utf8')
);
const libraryRoot = new URL('../projects/ngx-core-components/', import.meta.url);

if (rootPackage.version !== libraryPackage.version) {
  throw new Error(`Workspace version ${rootPackage.version} does not match library version ${libraryPackage.version}.`);
}

const angularPeerRange = libraryPackage.peerDependencies?.['@angular/core'];
const supportedMajors = [...String(angularPeerRange).matchAll(/\^(\d+)\.0\.0/g)]
  .map(match => Number(match[1]))
  .sort((left, right) => left - right);

if (supportedMajors.length === 0) {
  throw new Error('Could not determine supported Angular majors from the library peer dependency.');
}

const expectedRange = `Angular ${supportedMajors[0]}–${supportedMajors.at(-1)}`;
for (const path of ['README.md', 'projects/ngx-core-components/README.md']) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  if (!content.includes(expectedRange)) {
    throw new Error(`${path} must document the supported range as "${expectedRange}".`);
  }
}

const libraryReadme = await readFile(new URL('../projects/ngx-core-components/README.md', import.meta.url), 'utf8');
if (!libraryReadme.includes('[README](../../README.md) is the source of truth for the complete component list')) {
  throw new Error('The library README must point consumers to the root component catalogue.');
}

const actualEntryPoints = [];
for (const entry of await readdir(libraryRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  try {
    await access(new URL(`${entry.name}/ng-package.json`, libraryRoot));
    actualEntryPoints.push(entry.name);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const rootReadme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const componentTable = rootReadme.split('## Components\n')[1]?.split('\n## ')[0];
if (!componentTable) {
  throw new Error('README.md must include a Components table listing public entry points.');
}

const advertisedEntryPoints = [...componentTable.matchAll(/`ngx-core-components\/([^`]+)`/g)].map(match => match[1]);
const expectedCount = rootReadme.match(/(\d+) secondary entry points/);
const actualNames = [...actualEntryPoints].sort();
const advertisedNames = [...advertisedEntryPoints].sort();
if (
  new Set(advertisedNames).size !== advertisedNames.length ||
  expectedCount?.[1] !== String(actualNames.length) ||
  advertisedNames.length !== actualNames.length ||
  advertisedNames.some((name, index) => name !== actualNames[index])
) {
  throw new Error(
    `README.md secondary entry points are out of sync. Expected ${actualNames.length}: ${actualNames.join(', ')}.`
  );
}

console.log(
  `Public metadata is consistent: version ${rootPackage.version}, ${expectedRange}, ${actualNames.length} secondary entry points.`
);
