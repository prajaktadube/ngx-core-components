import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'basic',
    loadComponent: () =>
      import('./pages/basic-demo/basic-demo.component').then(m => m.BasicDemoComponent),
  },
  {
    path: 'large-dataset',
    loadComponent: () =>
      import('./pages/large-dataset-demo/large-dataset-demo.component').then(m => m.LargeDatasetDemoComponent),
  },
  {
    path: 'theming',
    loadComponent: () =>
      import('./pages/theming-demo/theming-demo.component').then(m => m.ThemingDemoComponent),
  },
  {
    path: 'interactive',
    loadComponent: () =>
      import('./pages/interactive-demo/interactive-demo.component').then(m => m.InteractiveDemoComponent),
  },
  {
    path: 'getting-started',
    loadComponent: () =>
      import('./pages/getting-started/getting-started.component').then(m => m.GettingStartedComponent),
  },
  {
    path: 'charts',
    loadComponent: () =>
      import('./pages/charts-demo/charts-demo.component').then(m => m.ChartsDemoComponent),
  },
  {
    path: 'inputs',
    loadComponent: () =>
      import('./pages/inputs-demo/inputs-demo.component').then(m => m.InputsDemoComponent),
  },
  {
    path: 'grid',
    loadComponent: () =>
      import('./pages/grid-demo/grid-demo.component').then(m => m.GridDemoComponent),
  },
  {
    path: 'tree-list',
    loadComponent: () =>
      import('./pages/tree-list-demo/tree-list-demo.component').then(m => m.TreeListDemoComponent),
  },
  {
    path: 'tooltip',
    loadComponent: () =>
      import('./pages/tooltip-demo/tooltip-demo.component').then(m => m.TooltipDemoComponent),
  },
  {
    path: 'dialog',
    loadComponent: () =>
      import('./pages/dialog-demo/dialog-demo.component').then(m => m.DialogDemoComponent),
  },
];
