function grid(options) {
  return (tree, context) => {
    context.logger.info('⚡ Scaffolding a pre-configured ngx-core-components DataGrid...');

    const name = options.name || 'data-grid';
    // Convert camelCase or PascalCase to dashed-case
    const dashedName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    // Convert dashed-case to camelCase
    const camelName = dashedName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    // Convert camelCase to PascalCase
    const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
    
    // Default file path to src/app/name/name.component.ts
    const filePath = `src/app/${dashedName}/${dashedName}.component.ts`;
    
    const content = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGridComponent } from 'ngx-core-components/grid';

@Component({
  selector: 'app-${dashedName}',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  template: \`
    <div style="padding: 24px; background: var(--ngx-color-surface, #fff); border-radius: var(--ngx-radius-lg, 8px); box-shadow: var(--ngx-shadow-md);">
      <h2 style="margin-top: 0; color: var(--ngx-color-text, #333); font-family: var(--ngx-font-family);">${pascalName} List</h2>
      
      <ngx-data-grid
        [data]="gridData"
        [columns]="columnDefs"
        [pageSize]="10"
        [pageable]="true"
        [sortable]="true"
        [filterable]="true"
      ></ngx-data-grid>
    </div>
  \`
})
export class ${pascalName}Component {
  gridData = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'User' }
  ];

  columnDefs = [
    { field: 'id', title: 'ID', width: 80, sortable: true },
    { field: 'name', title: 'Name', sortable: true, filterable: true },
    { field: 'email', title: 'Email', sortable: true, filterable: true },
    { field: 'role', title: 'Role', sortable: true }
  ];
}
`;

    if (tree.exists(filePath)) {
      context.logger.warn(`⚠️ File ${filePath} already exists. Skipping scaffolding.`);
    } else {
      tree.create(filePath, content);
      context.logger.info(`✅ Generated ${pascalName}Component with pre-configured ngx-data-grid at ${filePath}`);
    }

    return tree;
  };
}

module.exports = { grid };
