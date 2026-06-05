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
        json.dependencies['ngx-core-components'] = '^0.3.15';
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
          const options = project.architect.build.options;
          if (!options.styles) {
            options.styles = [];
          }
          const styleAsset = 'node_modules/ngx-core-components/themes/theme.css';
          
          // Check if style asset is already added
          const styleExists = options.styles.some(s => {
            if (typeof s === 'string') {
              return s === styleAsset;
            }
            return s.input === styleAsset;
          });

          if (!styleExists) {
            options.styles.push(styleAsset);
            tree.overwrite('angular.json', JSON.stringify(json, null, 2) + '\n');
            context.logger.info('🎨 Added core styling CSS variables to angular.json styles');
          }
        }
      } catch (err) {
        context.logger.warn('⚠️ Could not configure angular.json automatically: ' + err.message);
      }
    }

    context.logger.info('🎉 Successfully configured ngx-core-components!');
    context.logger.info('💡 Note: All components are standalone! You can import them directly in your component files, for example:');
    context.logger.info('   import { GanttChartComponent } from \'ngx-core-components/charts\';');
    
    return tree;
  };
}

module.exports = { ngAdd };
