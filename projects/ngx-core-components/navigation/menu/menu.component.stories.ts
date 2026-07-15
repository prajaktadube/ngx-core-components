import { MenuComponent } from './menu.component';

const meta = {
  title: 'Layout & Overlays/Navigation Menus/Menu',
  component: MenuComponent,
  tags: ['autodocs'],
};

export default meta;

const menuItems = [
  {
    label: 'File',
    icon: '📁',
    children: [
      { label: 'New Workspace', icon: '✨' },
      { label: 'Open File...', icon: '📂' },
      { separator: true },
      { label: 'Save Changes', icon: '💾' },
      { label: 'Export Project', icon: '📤', disabled: true }
    ]
  },
  {
    label: 'Edit',
    icon: '✏️',
    children: [
      { label: 'Undo Action', icon: '↩️' },
      { label: 'Redo Action', icon: '↪️' },
      { separator: true },
      { label: 'Cut Code', icon: '✂️' },
      { label: 'Copy Selection', icon: '📋' }
    ]
  },
  {
    label: 'Console Config',
    icon: '⚙️',
    children: [
      { label: 'Preferences', icon: '🔧' },
      { label: 'Theme Settings', icon: '🎨' },
      { label: 'Keymap Shortcuts', icon: '⌨#' }
    ]
  },
  { label: 'Community Help', icon: '❓' }
];

export const Default = {
  args: {
    items: menuItems,
    orientation: 'horizontal',
    activeItem: 'New Workspace'
  }
};

export const VerticalMenu = {
  ...Default,
  args: {
    ...Default.args,
    orientation: 'vertical'
  }
};
