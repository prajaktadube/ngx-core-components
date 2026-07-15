import { DrawerComponent } from './drawer.component';

const meta = {
  title: 'Layout & Overlays/Side Drawer/Drawer',
  component: DrawerComponent,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: {
      ...args,
      drawerOpen: false
    },
    template: `
      <div style="position: relative; height: 400px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center; z-index: 1;">
        <button (click)="drawerOpen = true" style="padding: 10px 20px; border: none; border-radius: 8px; background: #4f46e5; color: #fff; font-weight: 600; cursor: pointer; font-family: sans-serif;">
          Toggle Side Drawer
        </button>
        <ngx-drawer 
          [(isOpen)]="drawerOpen" 
          [position]="position" 
          [size]="size" 
          [theme]="theme" 
          [title]="title"
          style="position: absolute !important; width: 100%; height: 100%;"
        >
          <div style="font-family: sans-serif;">
            <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">This drawer panel slides out relative to the container frame. You can project any content here, including forms, checklists, or user details.</p>
          </div>
          <div drawer-footer style="display: flex; gap: 8px; justify-content: flex-end;">
            <button (click)="drawerOpen = false" style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; cursor: pointer; font-size: 12px;">Close</button>
            <button style="padding: 6px 12px; border: none; border-radius: 6px; background: #4f46e5; color: #fff; cursor: pointer; font-size: 12px;">Save Settings</button>
          </div>
        </ngx-drawer>
      </div>
    `
  }),
  args: {
    position: 'right',
    size: '300px',
    theme: 'light',
    title: 'Drawer Configurations'
  }
};

export const DarkThemeDrawer = {
  ...Default,
  args: {
    ...Default.args,
    theme: 'dark'
  }
};

export const PositionLeft = {
  ...Default,
  args: {
    ...Default.args,
    position: 'left'
  }
};
