export interface DemoNavItem {
  path: string;
  label: string;
  icon: string;
  desc: string;
  keywords?: string;
  featured?: boolean;
}

export interface DemoNavGroup {
  title: string;
  icon: string;
  items: DemoNavItem[];
}

export const DEMO_NAV_GROUPS: DemoNavGroup[] = [
  {
    title: 'Foundations',
    icon: '📚',
    items: [
      {
        path: '/home',
        label: 'Overview',
        icon: '🏠',
        desc: 'Library highlights and quick entry points',
        keywords: 'home overview intro summary',
        featured: true,
      },
      {
        path: '/getting-started',
        label: 'Getting Started',
        icon: '⚙️',
        desc: 'Install, setup, and first component',
        keywords: 'install setup first steps docs',
        featured: true,
      },
      {
        path: '/theming',
        label: 'Theming',
        icon: '🎨',
        desc: 'Design tokens and style customization',
        keywords: 'theming styling css variables design tokens',
      },
    ],
  },
  {
    title: 'Inputs & Actions',
    icon: '🖱️',
    items: [
      {
        path: '/buttons',
        label: 'Buttons & Chips',
        icon: '🔘',
        desc: 'Buttons, split actions, and chips',
        keywords: 'button chip split dropdown action',
        featured: true,
      },
      {
        path: '/inputs',
        label: 'Form Inputs',
        icon: '📝',
        desc: 'Textbox, dropdown, slider, picker controls',
        keywords: 'forms input textbox dropdown slider date rating',
        featured: true,
      },
    ],
  },
  {
    title: 'Layout & Overlays',
    icon: '🧩',
    items: [
      {
        path: '/layout',
        label: 'Layout & Containers',
        icon: '📐',
        desc: 'Card, tabs, accordion, splitter, stepper',
        keywords: 'layout card tabs accordion splitter stepper',
        featured: true,
      },
      {
        path: '/navigation',
        label: 'Navigation Menus',
        icon: '🧭',
        desc: 'Menus and breadcrumb patterns',
        keywords: 'navigation menu breadcrumb',
      },
      {
        path: '/tooltip',
        label: 'Tooltip & Popover',
        icon: '💬',
        desc: 'Contextual overlay messaging',
        keywords: 'tooltip popover hint info',
      },
      {
        path: '/dialog',
        label: 'Dialog Modals',
        icon: '🪟',
        desc: 'Programmatic overlays and modal flows',
        keywords: 'dialog modal overlay',
      },
    ],
  },
  {
    title: 'Data Presentation',
    icon: '🗂️',
    items: [
      {
        path: '/grid',
        label: 'Data Grid Enterprise',
        icon: '📑',
        desc: 'Sorting, filtering, paging, and editing',
        keywords: 'grid table sorting filtering paging',
        featured: true,
      },
      {
        path: '/tree-list',
        label: 'Tree & List Views',
        icon: '🌳',
        desc: 'Hierarchical and list rendering demos',
        keywords: 'tree list hierarchy',
      },
      {
        path: '/barcodes',
        label: 'Barcodes & QR',
        icon: '▦',
        desc: 'Barcode and QR generation demos',
        keywords: 'barcode qr code128',
      },
      {
        path: '/kanban',
        label: 'Kanban Board',
        icon: '📋',
        desc: 'Interactive drag-and-drop workflow tracking board',
        keywords: 'kanban board drag drop card list column workflow project tracker',
        featured: true,
      },
      {
        path: '/timeline',
        label: 'Timeline Events',
        icon: '⏳',
        desc: 'Vertical and horizontal chronological event streams',
        keywords: 'timeline events chronology history audit trace release notes',
        featured: true,
      },
    ],
  },
  {
    title: 'Visualizations',
    icon: '📊',
    items: [
      {
        path: '/charts',
        label: 'Standard Charts',
        icon: '📈',
        desc: 'Bar, line, pie, and sparkline charts',
        keywords: 'chart bar line pie sparkline',
        featured: true,
      },
      {
        path: '/gantt',
        label: 'Gantt Chart System',
        icon: '📅',
        desc: 'Enterprise interactive timeline scheduler',
        keywords: 'gantt timeline schedule drag resize zoom performance fleet',
        featured: true,
      },

    ],
  },
  {
    title: 'Intelligence',
    icon: '🤖',
    items: [
      {
        path: '/ai',
        label: 'AI Chat & Agent Console',
        icon: '🧠',
        desc: 'Structured steps, card carousels, and replies',
        keywords: 'ai agent chat console LLM structured tool call prompt',
        featured: true,
      },
    ],
  },
  {
    title: 'Feedback',
    icon: '🔔',
    items: [
      {
        path: '/feedback',
        label: 'Feedback & Progress',
        icon: '📣',
        desc: 'Badge, notifications, progress, skeleton',
        keywords: 'feedback notification progress badge skeleton',
      },
    ],
  },
];
