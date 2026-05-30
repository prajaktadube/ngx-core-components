import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'gantt',
    loadComponent: () =>
      import('./pages/gantt-demo/gantt-demo.component').then(m => m.GanttDemoComponent),
  },

  {
    path: 'theming',
    loadComponent: () =>
      import('./pages/theming-demo/theming-demo.component').then(m => m.ThemingDemoComponent),
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
    {
      path: 'buttons',
      loadComponent: () =>
        import('./pages/buttons-demo/buttons-demo.component').then(m => m.ButtonsDemoComponent),
    },
    {
      path: 'layout',
      loadComponent: () =>
        import('./pages/layout-demo/layout-demo.component').then(m => m.LayoutDemoComponent),
    },
    {
      path: 'feedback',
      loadComponent: () =>
        import('./pages/feedback-demo/feedback-demo.component').then(m => m.FeedbackDemoComponent),
    },
    {
      path: 'navigation',
      loadComponent: () =>
        import('./pages/navigation-demo/navigation-demo.component').then(m => m.NavigationDemoComponent),
    },
    {
      path: 'barcodes',
      loadComponent: () =>
        import('./pages/barcodes-demo/barcodes-demo.component').then(m => m.BarcodesDemoComponent),
    },
    {
      path: 'kanban',
      loadComponent: () =>
        import('./pages/kanban-demo/kanban-demo.component').then(m => m.KanbanDemoComponent),
    },
    {
      path: 'timeline',
      loadComponent: () =>
        import('./pages/timeline-demo/timeline-demo.component').then(m => m.TimelineDemoComponent),
    },

    {
      path: 'ai',
      loadComponent: () =>
        import('./pages/ai-demo/ai-demo.component').then(m => m.AiDemoComponent),
    },
];
