import { CommandPaletteComponent } from './command-palette.component';

const meta = {
  title: 'Layout & Overlays/Navigation Menus/CommandPalette',
  component: CommandPaletteComponent,
  tags: ['autodocs'],
};

export default meta;

const mockCommands = [
  { id: '1', label: 'Create New File', desc: 'Adds a blank code file to workspace', shortcut: 'Ctrl + N', icon: '📄', category: 'General' },
  { id: '2', label: 'Toggle Sidebar Explorer', desc: 'Collapses or expands project folder tree', shortcut: 'Ctrl + B', icon: '📁', category: 'View' },
  { id: '3', label: 'Run Local Build', desc: 'Initiates angular Ivy library compile', shortcut: 'Ctrl + Shift + B', icon: '🚀', category: 'Build' },
  { id: '4', label: 'Format Source Code', desc: 'Runs Prettier layout code formatting', shortcut: 'Ctrl + Alt + L', icon: '📋', category: 'Edit' },
  { id: '5', label: 'Clear Console Logs', desc: 'Wipes diagnostic messages from buffer', shortcut: 'Ctrl + L', icon: '🧹', category: 'Edit' },
  { id: '6', label: 'Exit Application', desc: 'Saves states and shuts dev console', shortcut: 'Alt + F4', icon: '✕', category: 'System' }
];

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="padding: 60px; text-align: center; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px;">Press <kbd style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-family: monospace;">Ctrl + K</kbd> or click the trigger below to launch the command console.</p>
        <button (click)="palette.toggleOpen()" style="padding: 10px 20px; border: none; border-radius: 8px; background: #4f46e5; color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
          Launch Command Palette
        </button>
        <ngx-command-palette #palette [commands]="commands" [placeholder]="placeholder" />
      </div>
    `
  }),
  args: {
    commands: mockCommands,
    placeholder: 'Type a command or search...'
  }
};
