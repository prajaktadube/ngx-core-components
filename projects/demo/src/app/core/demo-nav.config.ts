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
    title: 'Input And Actions',
    icon: '🖱️',
    items: [
      {
        path: '/buttons',
        label: 'Buttons And Chips',
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
    title: 'Structure And Navigation',
    icon: '🧩',
    items: [
      {
        path: '/layout',
        label: 'Layout',
        icon: '📐',
        desc: 'Card, tabs, accordion, splitter, stepper',
        keywords: 'layout card tabs accordion splitter stepper',
        featured: true,
      },
      {
        path: '/navigation',
        label: 'Navigation',
        icon: '🧭',
        desc: 'Menus and breadcrumb patterns',
        keywords: 'navigation menu breadcrumb',
      },
    ],
  },
  {
    title: 'Data Exploration',
    icon: '🗂️',
    items: [
      {
        path: '/grid',
        label: 'Data Grid',
        icon: '📑',
        desc: 'Sorting, filtering, paging, and editing',
        keywords: 'grid table sorting filtering paging',
        featured: true,
      },
      {
        path: '/tree-list',
        label: 'Tree And List',
        icon: '🌳',
        desc: 'Hierarchical and list rendering demos',
        keywords: 'tree list hierarchy',
      },
      {
        path: '/tooltip',
        label: 'Tooltip And Popover',
        icon: '💬',
        desc: 'Contextual overlay messaging',
        keywords: 'tooltip popover hint info',
      },
    ],
  },
  {
    title: 'Charts And Timelines',
    icon: '📊',
    items: [
      {
        path: '/charts',
        label: 'Charts',
        icon: '📈',
        desc: 'Bar, line, pie, and sparkline charts',
        keywords: 'chart bar line pie sparkline',
        featured: true,
      },
      {
        path: '/basic',
        label: 'Gantt Basic',
        icon: '📅',
        desc: 'Core timeline scheduling workflows',
        keywords: 'gantt basic timeline schedule',
      },
      {
        path: '/large-dataset',
        label: 'Gantt Large Dataset',
        icon: '⚡',
        desc: 'Performance behavior under load',
        keywords: 'gantt performance large data',
        featured: true,
      },
      {
        path: '/interactive',
        label: 'Gantt Interactive',
        icon: '🖱️',
        desc: 'Drag, resize, and dependency interactions',
        keywords: 'gantt interactive drag resize',
      },
    ],
  },
  {
    title: 'Feedback And Utilities',
    icon: '🔔',
    items: [
      {
        path: '/feedback',
        label: 'Feedback',
        icon: '📣',
        desc: 'Badge, notifications, progress, skeleton',
        keywords: 'feedback notification progress badge skeleton',
      },
      {
        path: '/dialog',
        label: 'Dialog',
        icon: '🪟',
        desc: 'Programmatic overlays and modal flows',
        keywords: 'dialog modal overlay',
      },
      {
        path: '/barcodes',
        label: 'Barcodes And QR',
        icon: '▦',
        desc: 'Barcode and QR generation demos',
        keywords: 'barcode qr code128',
      },
    ],
  },
];
