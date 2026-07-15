import { BreadcrumbComponent } from './breadcrumb.component';

const meta = {
  title: 'Layout & Overlays/Navigation Menus/Breadcrumb',
  component: BreadcrumbComponent,
  tags: ['autodocs'],
};

export default meta;

const defaultBreadcrumbs = [
  { label: 'Home', url: '/home', icon: '🏠' },
  { label: 'Developer Center', url: '/dev' },
  { label: 'Components Library', url: '/dev/components' },
  { label: 'Layout & Overlays', url: '/dev/components/layout' },
  { label: 'Breadcrumb Navigation', active: true }
];

export const Default = {
  args: {
    items: defaultBreadcrumbs,
    separator: '/',
    maxVisible: 0,
  },
};

export const CollapsibleEllipsis = {
  ...Default,
  args: {
    items: defaultBreadcrumbs,
    separator: '›',
    maxVisible: 3,
  },
};

export const CustomSeparator = {
  ...Default,
  args: {
    items: defaultBreadcrumbs,
    separator: '→',
    maxVisible: 0,
  },
};
