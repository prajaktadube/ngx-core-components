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
      path: 'dashboard-layout',
      loadComponent: () =>
        import('./pages/dashboard-layout-demo/dashboard-layout-demo.component').then(m => m.DashboardLayoutDemoComponent),
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
    {
      path: 'scheduler',
      loadComponent: () =>
        import('./pages/scheduler-demo/scheduler-demo.component').then(m => m.SchedulerDemoComponent),
    },
    {
      path: 'avatars',
      loadComponent: () =>
        import('./pages/avatars-demo/avatars-demo.component').then(m => m.AvatarsDemoComponent),
    },
    {
      path: 'virtual-list',
      loadComponent: () =>
        import('./pages/virtual-list-demo/virtual-list-demo.component').then(m => m.VirtualListDemoComponent),
    },
    {
      path: 'stat-cards',
      loadComponent: () =>
        import('./pages/stat-cards-demo/stat-cards-demo.component').then(m => m.StatCardsDemoComponent),
    },
    {
      path: 'tag-input',
      loadComponent: () =>
        import('./pages/tag-input-demo/tag-input-demo.component').then(m => m.TagInputDemoComponent),
    },
    {
      path: 'countdown',
      loadComponent: () =>
        import('./pages/countdown-demo/countdown-demo.component').then(m => m.CountdownDemoComponent),
    },
    {
      path: 'carousel',
      loadComponent: () =>
        import('./pages/carousel-demo/carousel-demo.component').then(m => m.CarouselDemoComponent),
    },
    {
      path: 'file-preview',
      loadComponent: () =>
        import('./pages/file-preview-demo/file-preview-demo.component').then(m => m.FilePreviewDemoComponent),
    },
    {
      path: 'drawer',
      loadComponent: () =>
        import('./pages/drawer-demo/drawer-demo.component').then(m => m.DrawerDemoComponent),
    },
    {
      path: 'segmented-control',
      loadComponent: () =>
        import('./pages/segmented-control-demo/segmented-control-demo.component').then(m => m.SegmentedControlDemoComponent),
    },
    {
      path: 'image-compare',
      loadComponent: () =>
        import('./pages/image-compare-demo/image-compare-demo.component').then(m => m.ImageCompareDemoComponent),
    },
    {
      path: 'key-value-list',
      loadComponent: () =>
        import('./pages/key-value-list-demo/key-value-list-demo.component').then(m => m.KeyValueListDemoComponent),
    },
    {
      path: 'empty-state',
      loadComponent: () =>
        import('./pages/empty-state-demo/empty-state-demo.component').then(m => m.EmptyStateDemoComponent),
    },
    {
      path: 'back-to-top',
      loadComponent: () =>
        import('./pages/back-to-top-demo/back-to-top-demo.component').then(m => m.BackToTopDemoComponent),
    },
];
