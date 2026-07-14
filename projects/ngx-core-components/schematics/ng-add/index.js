function ngAdd(options) {
  return (tree, context) => {
    context.logger.info('📦 Configuring ngx-core-components in your Angular project...');

    // 1. Add dependency to package.json
    if (tree.exists('package.json')) {
      const packageJsonContent = tree.read('package.json').toString('utf-8');
      const json = JSON.parse(packageJsonContent);
      if (!json.dependencies) {
        json.dependencies = {};
      }
      if (!json.dependencies['ngx-core-components']) {
        json.dependencies['ngx-core-components'] = '^0.3.19';
        tree.overwrite('package.json', JSON.stringify(json, null, 2) + '\n');
        context.logger.info('✅ Added ngx-core-components to dependencies in package.json');
      }
    }

    // 2. Add style asset to angular.json
    if (tree.exists('angular.json')) {
      try {
        const angularJsonContent = tree.read('angular.json').toString('utf-8');
        const json = JSON.parse(angularJsonContent);
        const projects = json.projects;
        
        // Find default project or first available project
        const projectName = json.defaultProject || Object.keys(projects)[0];
        const project = projects[projectName];
        
        if (project && project.architect && project.architect.build && project.architect.build.options) {
          const buildOptions = project.architect.build.options;
          if (!buildOptions.styles) {
            buildOptions.styles = [];
          }
          const styleAsset = 'node_modules/ngx-core-components/themes/theme.css';
          
          // Check if style asset is already added
          const styleExists = buildOptions.styles.some(s => {
            if (typeof s === 'string') {
              return s === styleAsset;
            }
            return s.input === styleAsset;
          });

          if (!styleExists) {
            buildOptions.styles.push(styleAsset);
            tree.overwrite('angular.json', JSON.stringify(json, null, 2) + '\n');
            context.logger.info('🎨 Added ngx-core-components theme CSS to angular.json styles');
          }
        }
      } catch (err) {
        context.logger.warn('⚠️ Could not configure angular.json automatically: ' + err.message);
      }
    }

    // 3. Apply theme preference (dark mode setup)
    const theme = options && options.theme ? options.theme : 'light';
    if (theme === 'dark') {
      applyDarkTheme(tree, context);
    } else if (theme === 'custom') {
      scaffoldCustomTheme(tree, context);
    }

    // 4. Scaffold i18n provider if requested
    if (options && options.i18n) {
      scaffoldI18nProvider(tree, context);
    }

    context.logger.info('');
    context.logger.info('🎉 Successfully configured ngx-core-components!');
    context.logger.info('');
    context.logger.info('💡 All components are standalone — import them directly:');
    context.logger.info('   import { DataGridComponent } from \'ngx-core-components/grid\';');
    context.logger.info('   import { GanttChartComponent } from \'ngx-core-components/charts\';');
    context.logger.info('   import { DropdownComponent } from \'ngx-core-components/inputs\';');
    context.logger.info('');
    context.logger.info('📖 Docs: https://prajaktadube.github.io/ngx-core-components/home');
    context.logger.info('');
    if (theme === 'dark') {
      context.logger.info('🌙 Dark theme enabled. Add data-theme="dark" to your <body> tag,');
      context.logger.info('   or toggle it programmatically.');
    }
    if (theme === 'custom') {
      context.logger.info('🎨 Custom theme file created at src/styles/ngx-theme-overrides.css');
      context.logger.info('   Edit this file to customize colors, spacing, and typography.');
    }

    return tree;
  };
}

/**
 * Applies dark theme by modifying the index.html body tag.
 */
function applyDarkTheme(tree, context) {
  const indexPaths = ['src/index.html', 'projects/demo/src/index.html'];
  for (const indexPath of indexPaths) {
    if (tree.exists(indexPath)) {
      let html = tree.read(indexPath).toString('utf-8');
      if (!html.includes('data-theme="dark"')) {
        html = html.replace('<body', '<body data-theme="dark"');
        tree.overwrite(indexPath, html);
        context.logger.info(`🌙 Applied dark theme to ${indexPath}`);
      }
      break;
    }
  }
}

/**
 * Scaffolds a custom CSS theme overrides file with all available tokens.
 */
function scaffoldCustomTheme(tree, context) {
  const customThemePath = 'src/styles/ngx-theme-overrides.css';
  if (tree.exists(customThemePath)) {
    context.logger.info('ℹ️ Custom theme file already exists, skipping.');
    return;
  }

  const content = `/**
 * ngx-core-components — Custom Theme Overrides
 *
 * Uncomment and modify the variables below to customize the library's appearance.
 * See full token reference: https://prajaktadube.github.io/ngx-core-components/theming
 */

:root {
  /* ── Brand Colors ── */
  /* --ngx-color-primary: #4f46e5; */
  /* --ngx-color-primary-hover: #4338ca; */
  /* --ngx-color-primary-light: #e0e7ff; */
  /* --ngx-color-secondary: #64748b; */
  /* --ngx-color-success: #10b981; */
  /* --ngx-color-warning: #f59e0b; */
  /* --ngx-color-danger: #ef4444; */

  /* ── Surface & Text ── */
  /* --ngx-color-surface: #ffffff; */
  /* --ngx-color-surface-alt: #f8fafc; */
  /* --ngx-color-border: #e2e8f0; */
  /* --ngx-color-text: #0f172a; */
  /* --ngx-color-text-secondary: #64748b; */

  /* ── Typography ── */
  /* --ngx-font-family: system-ui, -apple-system, sans-serif; */
  /* --ngx-font-size-sm: 0.875rem; */
  /* --ngx-font-size-md: 1rem; */

  /* ── Borders & Radius ── */
  /* --ngx-radius-sm: 0.125rem; */
  /* --ngx-radius-md: 0.25rem; */
  /* --ngx-radius-lg: 0.375rem; */

  /* ── Shadows ── */
  /* --ngx-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05); */
  /* --ngx-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1); */
}
`;

  tree.create(customThemePath, content);

  // Also add the custom theme file to angular.json styles
  if (tree.exists('angular.json')) {
    try {
      const angularJsonContent = tree.read('angular.json').toString('utf-8');
      const json = JSON.parse(angularJsonContent);
      const projects = json.projects;
      const projectName = json.defaultProject || Object.keys(projects)[0];
      const project = projects[projectName];

      if (project && project.architect && project.architect.build && project.architect.build.options) {
        const buildOptions = project.architect.build.options;
        if (!buildOptions.styles) {
          buildOptions.styles = [];
        }
        if (!buildOptions.styles.includes(customThemePath)) {
          buildOptions.styles.push(customThemePath);
          tree.overwrite('angular.json', JSON.stringify(json, null, 2) + '\n');
        }
      }
    } catch (err) {
      context.logger.warn('⚠️ Could not add custom theme to angular.json: ' + err.message);
    }
  }
}

/**
 * Scaffolds an i18n provider file for overriding library labels.
 */
function scaffoldI18nProvider(tree, context) {
  const i18nPath = 'src/app/ngx-i18n.provider.ts';
  if (tree.exists(i18nPath)) {
    context.logger.info('ℹ️ i18n provider file already exists, skipping.');
    return;
  }

  const content = `import { Provider } from '@angular/core';
import { NGX_CORE_I18N } from 'ngx-core-components/i18n';

/**
 * Customize ngx-core-components labels here.
 * Add this provider to your app.config.ts or app.module.ts.
 *
 * Example usage in app.config.ts:
 *   providers: [ngxCoreI18nProvider]
 */
export const ngxCoreI18nProvider: Provider = {
  provide: NGX_CORE_I18N,
  useValue: {
    grid: {
      noData: 'No records found',
      filterPlaceholder: 'Filter...',
      pageOf: (page: number, total: number) => \`Page \${page} of \${total}\`,
    },
    datePicker: {
      today: 'Today',
      clear: 'Clear',
    },
    dialog: {
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
  },
};
`;

  tree.create(i18nPath, content);
  context.logger.info('🌐 Created i18n provider at ' + i18nPath);
}

module.exports = { ngAdd };
