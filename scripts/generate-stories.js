const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'projects', 'ngx-core-components');

const manualStories = [
  'switch.component.stories.ts',
  'dropdown.component.stories.ts',
  'date-picker.component.stories.ts',
  'autocomplete.component.stories.ts',
  'tab-strip.component.stories.ts',
  'notification.component.stories.ts',
  'form-designer.component.stories.ts',
  'form-builder.component.stories.ts',
  'ai-chat.component.stories.ts',
  'barcode.component.stories.ts',
  'qr-code.component.stories.ts',
  'heatmap-chart.component.stories.ts',
  'chip.component.stories.ts',
  'date-range-picker.component.stories.ts',
  'button-group.component.stories.ts',
  'timeline.component.stories.ts',
  'gantt-chart.component.stories.ts',
  'data-grid.component.stories.ts',
  'stat-card.component.stories.ts',
  'progress-bar.component.stories.ts',
  'alert.component.stories.ts',
  'avatar.component.stories.ts',
  'badge.component.stories.ts',
  'splitter.component.stories.ts',
  'dashboard-layout.component.stories.ts',
  'carousel.component.stories.ts',
  'dialog-container.component.stories.ts',
  'popover.component.stories.ts',
  'breadcrumb.component.stories.ts',
  'menu.component.stories.ts',
  'command-palette.component.stories.ts',
  'context-menu.component.stories.ts',
  'back-to-top.component.stories.ts',
  'card.component.stories.ts',
  'accordion.component.stories.ts',
  'stepper.component.stories.ts',
  'drawer.component.stories.ts',
  'textbox.component.stories.ts',
  'checkbox.component.stories.ts',
  'slider.component.stories.ts',
  'rating.component.stories.ts',
  'numeric-textbox.component.stories.ts',
  'textarea.component.stories.ts',
  'color-picker.component.stories.ts',
  'radio-group.component.stories.ts',
  'multi-select.component.stories.ts',
  'time-picker.component.stories.ts',
  'button.component.stories.ts',
  'skeleton.component.stories.ts',
  'bar-chart.component.stories.ts',
  'line-chart.component.stories.ts',
  'pie-chart.component.stories.ts',
  'gauge-chart.component.stories.ts',
  'radar-chart.component.stories.ts',
  'countdown.component.stories.ts',
  'empty-state.component.stories.ts'
];

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
  const regex = /([a-zA-Z0-9_]+)\s*=\s*input(?:.required)?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const matchStart = match.index;
    
    const startIdx = content.indexOf('input', matchStart);
    if (startIdx === -1) continue;
    
    let openParenIdx = content.indexOf('(', startIdx);
    if (openParenIdx === -1) continue;
    
    let type = '';
    const angleStart = content.indexOf('<', startIdx);
    if (angleStart !== -1 && angleStart < openParenIdx) {
      let depth = 0;
      let angleEnd = -1;
      for (let i = angleStart; i < content.length; i++) {
        if (content[i] === '<') depth++;
        else if (content[i] === '>') {
          depth--;
          if (depth === 0) {
            angleEnd = i;
            break;
          }
        }
      }
      if (angleEnd !== -1) {
        type = content.substring(angleStart + 1, angleEnd).trim();
        openParenIdx = content.indexOf('(', angleEnd);
      }
    }
    
    if (openParenIdx === -1) continue;
    
    let parenDepth = 0;
    let defaultValue = '';
    let foundEnd = false;
    for (let i = openParenIdx; i < content.length; i++) {
      if (content[i] === '(') {
        parenDepth++;
      } else if (content[i] === ')') {
        parenDepth--;
        if (parenDepth === 0) {
          defaultValue = content.substring(openParenIdx + 1, i).trim();
          foundEnd = true;
          break;
        }
      }
    }
    
    if (foundEnd) {
      inputs.push({ name, type, defaultValue });
    }
  }
  return inputs;
}

function getStorybookCategory(file, className, parts) {
  const subpkg = parts[0];
  const componentFolder = parts[1]; 
  const componentName = className.replace('Component', '');

  // 1. Intelligence
  if (subpkg === 'ai') {
    return `Intelligence/AI Chat & Agent Console/${componentName}`;
  }

  // 2. Barcodes
  if (subpkg === 'barcodes') {
    return `Data Presentation/Barcodes & QR/${componentName}`;
  }

  // 3. Buttons & Chips
  if (subpkg === 'buttons') {
    return `Inputs & Actions/Buttons & Chips/${componentName}`;
  }

  // 4. Gantt
  if (componentFolder === 'gantt-chart') {
    return `Visualizations/Gantt Chart System/${componentName}`;
  }

  // 5. Charts
  if (subpkg === 'charts') {
    return `Visualizations/Charts & Graphs/${componentName}`;
  }

  // 6. Dialog Modals
  if (subpkg === 'dialog') {
    return `Layout & Overlays/Dialog Modals/${componentName}`;
  }

  // 7. Feedback Subcategories
  if (subpkg === 'feedback') {
    if (componentFolder === 'avatar') return `Feedback/Avatars/${componentName}`;
    if (componentFolder === 'stat-card') return `Feedback/Stat Cards & KPI/${componentName}`;
    if (componentFolder === 'countdown') return `Feedback/Countdown Timer/${componentName}`;
    if (componentFolder === 'empty-state') return `Feedback/Empty State Placeholders/${componentName}`;
    return `Feedback/Feedback & Progress/${componentName}`;
  }

  // 8. Grid
  if (subpkg === 'grid') {
    return `Data Presentation/Data Grid Enterprise/${componentName}`;
  }

  // 9. Inputs & Actions / Advanced Inputs
  if (subpkg === 'inputs') {
    if (componentFolder === 'segmented-control') return `Inputs & Actions/Segmented Control/${componentName}`;
    if (componentFolder === 'tag-input') return `Advanced Inputs/Tag Input/${componentName}`;
    if (componentFolder === 'file-preview') return `Advanced Inputs/File Preview Board/${componentName}`;
    return `Inputs & Actions/Form Inputs/${componentName}`;
  }

  // 10. Layout & Overlays
  if (subpkg === 'layout') {
    if (componentFolder === 'dashboard-layout') return `Layout & Overlays/Dashboard Layout/${componentName}`;
    if (componentFolder === 'carousel') return `Layout & Overlays/Carousel Slider/${componentName}`;
    if (componentFolder === 'drawer') return `Layout & Overlays/Side Drawer/${componentName}`;
    return `Layout & Overlays/Layout & Containers/${componentName}`;
  }

  // 11. Navigation
  if (subpkg === 'navigation') {
    if (componentFolder === 'back-to-top') return `Layout & Overlays/Back to Top Indicator/${componentName}`;
    return `Layout & Overlays/Navigation Menus/${componentName}`;
  }

  // 12. Tooltip & Popover
  if (file.includes('tooltip')) {
    return `Layout & Overlays/Tooltip & Popover/${componentName}`;
  }

  // 13. Views subcategories
  if (subpkg === 'views') {
    if (componentFolder === 'tree-view' || componentFolder === 'list-view') return `Data Presentation/Tree & List Views/${componentName}`;
    if (componentFolder === 'kanban') return `Data Presentation/Kanban Board/${componentName}`;
    if (componentFolder === 'timeline') return `Data Presentation/Timeline Events/${componentName}`;
    if (componentFolder === 'scheduler') return `Data Presentation/Scheduler Planner/${componentName}`;
    if (componentFolder === 'calendar') return `Data Presentation/Interactive Calendar/${componentName}`;
    if (componentFolder === 'image-compare') return `Data Presentation/Image Comparison/${componentName}`;
    if (componentFolder === 'key-value-list') return `Data Presentation/Key-Value List/${componentName}`;
    if (componentFolder === 'virtual-list') return `Advanced Inputs/Virtual List/${componentName}`;
  }

  // Fallback
  return `Components/${componentName}`;
}

function generateMockValue(name, type, defaultValue, className) {
  // Hardcoded special variables
  if (name === 'series') {
    return `[{ name: 'Sales', data: [31, 40, 28, 51, 42, 109, 100] }]`;
  }
  if (name === 'categories') {
    return `['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']`;
  }
  if (name === 'data') {
    if (className.includes('Tree')) {
      return `[{ id: '1', label: 'Documents', children: [{ id: '1-1', label: 'Report.docx' }] }]`;
    }
    if (className.includes('Kanban')) {
      return `[{ id: 'col-1', name: 'To Do', items: [{ id: 't-1', title: 'Task 1' }] }]`;
    }
    if (className.includes('Radial')) {
      return `[{ name: 'Activity', value: 80, color: '#4f46e5' }, { name: 'Rest', value: 20, color: '#e2e8f0' }]`;
    }
    if (className.includes('OrgChart')) {
      return `{ id: 'root', name: 'CEO', title: 'Chief Exec', children: [{ id: '1', name: 'VP', title: 'Vice President' }] }`;
    }
    return `[{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }]`;
  }
  if (name === 'items') {
    if (className.includes('ListView')) {
      return `['Item 1', 'Item 2', 'Item 3']`;
    }
    if (className.includes('Dashboard')) {
      return `[{ id: 'card-1', col: 1, row: 1, sizeX: 4, sizeY: 2, title: 'Revenue' }]`;
    }
    if (className.includes('ContextMenu') || className.includes('Menu')) {
      return `[{ label: 'Edit', icon: '✏️' }, { label: 'Delete', icon: '🗑️' }]`;
    }
    return `[{ id: '1', label: 'Item 1', value: '1' }, { id: '2', label: 'Item 2', value: '2' }]`;
  }

  // Basic types
  if (type === 'boolean' || defaultValue === 'false' || defaultValue === 'true') {
    return defaultValue || 'false';
  }
  if (type === 'number' || /^\d+$/.test(defaultValue)) {
    return defaultValue || '0';
  }
  if (defaultValue.startsWith("'") || defaultValue.startsWith('"')) {
    return defaultValue;
  }
  if (name === 'color' || name === 'foreground' || name === 'background' || name === 'colors') {
    if (name === 'colors') return `['#4f46e5', '#10b981', '#f59e0b', '#ef4444']`;
    return `'#4f46e5'`;
  }

  // Label / Title keywords
  if (name.toLowerCase().includes('title') || name.toLowerCase().includes('label') || name.toLowerCase().includes('placeholder')) {
    return `'Sample ${name}'`;
  }
  if (name.toLowerCase().includes('text') || name.toLowerCase().includes('content') || name.toLowerCase().includes('desc')) {
    return `'This is a sample description text content.'`;
  }

  // Check if default value has a nested function call we parsed (like Math.random())
  if (defaultValue.includes('(')) {
    return defaultValue;
  }

  // Fallback
  return 'null';
}

function generateStories() {
  const files = getFiles(rootDir);
  console.log(`Found ${files.length} components.`);

  for (const file of files) {
    const dir = path.dirname(file);
    const filename = path.basename(file);
    const storyFilename = filename.replace('.component.ts', '.component.stories.ts');
    const storyFile = path.join(dir, storyFilename);

    // Skip if it is a manual story
    if (manualStories.includes(storyFilename)) {
      console.log(`Skipping manual story: ${storyFile}`);
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    
    // Find class name: export class XComponent
    const classMatch = content.match(/export\s+class\s+([A-Za-z0-9_]+Component)/) || content.match(/export\s+class\s+([A-Za-z0-9_]+)/);
    if (!classMatch) {
      console.warn(`Could not find class name in ${file}`);
      continue;
    }
    const className = classMatch[1];

    // Determine category based on mapping
    const relativePath = path.relative(rootDir, file);
    const parts = relativePath.split(path.sep);
    const category = getStorybookCategory(file, className, parts);

    // Parse signal inputs
    const inputs = parseInputs(content);

    // Construct args and argTypes
    const argsLines = [];
    const argTypesLines = [];

    for (const input of inputs) {
      const mockVal = generateMockValue(input.name, input.type, input.defaultValue, className);
      argsLines.push(`    ${input.name}: ${mockVal},`);

      // Check if type is a union of string literals
      if (input.type && input.type.includes('|') && !input.type.includes('[]')) {
        const parts = input.type.split('|').map(x => x.trim().replace(/['"]/g, ''));
        const isStringUnion = parts.every(x => /^[a-zA-Z0-9_-]+$/.test(x));
        if (isStringUnion) {
          argTypesLines.push(`    ${input.name}: {`);
          argTypesLines.push(`      control: 'select',`);
          argTypesLines.push(`      options: ${JSON.stringify(parts)},`);
          argTypesLines.push(`    },`);
        }
      }
    }

    // Story template in pure JS syntax to satisfy acorn and TypeScript compiler simultaneously
    const storyContent = `import { ${className} } from './${filename.replace('.ts', '')}';

const meta = {
  title: '${category}',
  component: ${className},
  tags: ['autodocs'],
${argTypesLines.length > 0 ? `  argTypes: {\n${argTypesLines.join('\n')}\n  },` : ''}
};

export default meta;

export const Default = {
  args: {
${argsLines.join('\n')}
  },
};
`;

    fs.writeFileSync(storyFile, storyContent, 'utf8');
    console.log(`Generated/Overwritten story: ${storyFile}`);
  }
}

generateStories();
