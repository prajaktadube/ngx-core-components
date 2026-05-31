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
      {
        path: '/segmented-control',
        label: 'Segmented Control',
        icon: '🎛️',
        desc: 'iOS-like active sliding highlights control pill',
        keywords: 'segmented control pill selector tab options toggle',
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
        path: '/dashboard-layout',
        label: 'Dashboard Layout',
        icon: '📊',
        desc: 'Snapping CSS Grid, dragging, and resize handles',
        keywords: 'dashboard layout grid drag drop resize widget board',
        featured: true,
      },
      {
        path: '/carousel',
        label: 'Carousel Slider',
        icon: '🎠',
        desc: 'Autoplay content slider, touch gestures, indicators',
        keywords: 'carousel slider slide show gallery testimonials',
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
        path: '/back-to-top',
        label: 'Back to Top Indicator',
        icon: '⬆️',
        desc: 'Scroll indicators and scroll triggers',
        keywords: 'back to top scroll progress button navigation return',
        featured: true,
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
      {
        path: '/drawer',
        label: 'Side Drawer',
        icon: '🚪',
        desc: 'Slide-out overlay sheets and backdrops',
        keywords: 'drawer sheet slide panel offcanvas overlay dialog',
        featured: true,
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
      {
        path: '/scheduler',
        label: 'Scheduler Planner',
        icon: '🗓️',
        desc: 'Day, Week, and Month appointment calendar scheduler view',
        keywords: 'scheduler planner calendar week day month slots bookings agenda',
        featured: true,
      },
      {
        path: '/image-compare',
        label: 'Image Comparison',
        icon: '🖼️',
        desc: 'Sleek before/after sliding overlay comparison grids',
        keywords: 'image comparison compare slider drag clip side by side before after',
        featured: true,
      },
      {
        path: '/key-value-list',
        label: 'Key-Value List',
        icon: '📋',
        desc: 'Collapsible detail tables, copy actions, searching',
        keywords: 'key value list property grid details card collapsible config',
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
      {
        path: '/avatars',
        label: 'Avatars',
        icon: '👤',
        desc: 'Avatar, avatar groups, status indicators',
        keywords: 'avatar user profile group status indicator',
        featured: true,
      },
      {
        path: '/stat-cards',
        label: 'Stat Cards & KPI',
        icon: '📈',
        desc: 'KPI metric stat cards with trends and variants',
        keywords: 'stat card kpi metric dashboard widget trend',
        featured: true,
      },
      {
        path: '/countdown',
        label: 'Countdown Timer',
        icon: '⏱️',
        desc: 'Progress rings, flip cards, variants, and ticks',
        keywords: 'countdown timer watch progress deadline interval',
        featured: true,
      },
      {
        path: '/empty-state',
        label: 'Empty State Placeholders',
        icon: '📭',
        desc: 'Visual placeholders for empty dashboards, search results, and logs',
        keywords: 'empty state placeholder fallback missing search inbox data error',
        featured: true,
      },
    ],
  },
  {
    title: 'Advanced Inputs',
    icon: '🏷️',
    items: [
      {
        path: '/tag-input',
        label: 'Tag Input',
        icon: '🏷️',
        desc: 'Chip-based tag input with keyboard shortcuts',
        keywords: 'tag chip input label multivalue',
        featured: true,
      },
      {
        path: '/virtual-list',
        label: 'Virtual List',
        icon: '⚡',
        desc: 'High-performance windowed list for 10k+ items',
        keywords: 'virtual scroll list performance windowing large dataset',
        featured: true,
      },
      {
        path: '/file-preview',
        label: 'File Preview Board',
        icon: '📁',
        desc: 'Thumbnail grids, file type categorization, action triggers',
        keywords: 'file preview upload folder icon thumbnail queue',
        featured: true,
      },
    ],
  },
];
