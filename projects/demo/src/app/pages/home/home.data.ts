export interface JourneyCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  tags: string[];
}

export interface CompareTrack {
  name: string;
  bestFor: string;
  route: string;
  note: string;
}

export const BUILD_CARDS: JourneyCard[] = [
  {
    icon: '🚀',
    title: 'Getting Started',
    description: 'Install the library and render your first standalone component.',
    route: '/getting-started',
    tags: ['Install', 'Setup', 'First render'],
  },
  {
    icon: '📝',
    title: 'Inputs',
    description: 'Build forms with textbox, dropdown, slider, date, and multiselect controls.',
    route: '/inputs',
    tags: ['Forms', 'Validation', 'CVA'],
  },
  {
    icon: '🔘',
    title: 'Buttons And Chips',
    description: 'Define action hierarchy with primary, secondary, split, and chip interactions.',
    route: '/buttons',
    tags: ['Action hierarchy', 'States', 'A11y'],
  },
  {
    icon: '📐',
    title: 'Layout',
    description: 'Compose page structure with cards, tabs, accordions, and stepper flow.',
    route: '/layout',
    tags: ['Structure', 'Progressive disclosure'],
  },
];

export const EXPLORE_CARDS: JourneyCard[] = [
  {
    icon: '📈',
    title: 'Charts',
    description: 'Inspect line, bar, pie, sparkline, and timeline visualization patterns.',
    route: '/charts',
    tags: ['Data viz', 'Tooltips', 'Legends'],
  },
  {
    icon: '📑',
    title: 'Data Grid',
    description: 'Test sorting, filtering, grouping, paging, templates, and editing.',
    route: '/grid',
    tags: ['Server mode', 'Editing', 'Grouping'],
  },
  {
    icon: '🌳',
    title: 'Tree And List',
    description: 'Evaluate hierarchical navigation, selection states, and keyboard control.',
    route: '/tree-list',
    tags: ['Hierarchy', 'Keyboard', 'Selection'],
  },
  {
    icon: '💬',
    title: 'Tooltip And Popover',
    description: 'Preview lightweight hinting versus rich contextual overlays.',
    route: '/tooltip',
    tags: ['Overlay', 'Positioning', 'Discoverability'],
  },
];

export const COMPARE_TRACKS: CompareTrack[] = [
  {
    name: 'Gantt Basic',
    bestFor: 'Simple scheduling walkthroughs',
    route: '/basic',
    note: 'Fast intro to timeline interactions',
  },
  {
    name: 'Gantt Large Dataset',
    bestFor: 'Performance and virtualization checks',
    route: '/large-dataset',
    note: 'Useful for enterprise-scale scenarios',
  },
  {
    name: 'Gantt Interactive',
    bestFor: 'Edit-heavy workflows with drag and dependencies',
    route: '/interactive',
    note: 'Best for power-user behavior validation',
  },
  {
    name: 'Theming',
    bestFor: 'Visual consistency and token alignment',
    route: '/theming',
    note: 'Validate brand fit across components',
  },
];

export const INTEGRATE_CARDS: JourneyCard[] = [
  {
    icon: '🪟',
    title: 'Dialog',
    description: 'Embed form and confirmation flows in overlay-driven interactions.',
    route: '/dialog',
    tags: ['Modal flow', 'Backdrop', 'Programmatic open'],
  },
  {
    icon: '📣',
    title: 'Feedback',
    description: 'Add status communication with badge, progress, skeleton, and notifications.',
    route: '/feedback',
    tags: ['Async UX', 'Load states', 'Alerts'],
  },
  {
    icon: '🧭',
    title: 'Navigation',
    description: 'Connect routes with breadcrumb and menu structures.',
    route: '/navigation',
    tags: ['Information architecture', 'Wayfinding'],
  },
  {
    icon: '▦',
    title: 'Barcodes And QR',
    description: 'Integrate utility rendering for labels, inventory, and scan workflows.',
    route: '/barcodes',
    tags: ['Utility', 'Print', 'Scan ready'],
  },
];
