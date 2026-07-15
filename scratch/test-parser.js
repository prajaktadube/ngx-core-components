const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'projects', 'ngx-core-components');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (file.endsWith('.component.ts') && !file.includes('spec.ts')) {
        files.push(name);
      }
    }
  }
  return files;
}

function parseInputs(content) {
  const inputs = [];
  const regex = /([a-zA-Z0-9_]+)\s*=\s*input(?:.required)?\s*(?:<([^>]+)>)?\s*\(([^)]*)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const type = match[2] ? match[2].trim() : '';
    const defaultValue = match[3] ? match[3].trim() : '';
    inputs.push({ name, type, defaultValue });
  }
  return inputs;
}

const files = getFiles(rootDir);
console.log(`Analyzing ${files.length} components...`);

const sampleFiles = files.filter((f, idx) => idx % 8 === 0).slice(0, 15);
for (const f of sampleFiles) {
  console.log(`\nFile: ${path.basename(f)}`);
  const content = fs.readFileSync(f, 'utf8');
  console.log('Inputs:', parseInputs(content));
}
