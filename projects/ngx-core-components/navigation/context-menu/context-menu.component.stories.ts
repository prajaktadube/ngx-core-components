import { ContextMenuComponent } from './context-menu.component';

const meta = {
  title: 'Layout & Overlays/Navigation Menus/ContextMenu',
  component: ContextMenuComponent,
  tags: ['autodocs'],
};

export default meta;

const mockContextMenuItems = [
  { id: '1', label: 'View Project Details', icon: '🔍', shortcut: '💡' },
  { id: '2', label: 'Rename Element', icon: '✏️', shortcut: 'F2' },
  { separator: true },
  { 
    id: '3', 
    label: 'Refactor Code', 
    icon: '⚙️', 
    children: [
      { id: '3-1', label: 'Extract Function', shortcut: 'Ctrl + Alt + M' },
      { id: '3-2', label: 'Inline Variable', shortcut: 'Ctrl + Alt + N' }
    ]
  },
  { separator: true },
  { id: '4', label: 'Move to Trash', icon: '🗑️', danger: true, shortcut: 'Del' }
];

export const Default = {
  render: (args: any) => ({
    props: {
      ...args,
      isOpen: false,
      menuX: 0,
      menuY: 0
    },
    template: `
      <div 
        (contextmenu)="$event.preventDefault(); isOpen = true; menuX = $event.clientX; menuY = $event.clientY"
        style="height: 350px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: context-menu; position: relative;"
      >
        <p style="color: #64748b; font-size: 14px; text-align: center; max-width: 320px; line-height: 1.5;">Right-click anywhere inside this gray target workspace area to trigger the Context Menu.</p>
        <ngx-context-menu 
          [items]="items" 
          [open]="isOpen" 
          [x]="menuX" 
          [y]="menuY" 
          [width]="width" 
          (openChange)="isOpen = $event"
        />
      </div>
    `
  }),
  args: {
    items: mockContextMenuItems,
    width: 220
  }
};
