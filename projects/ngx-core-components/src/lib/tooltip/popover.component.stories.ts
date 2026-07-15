import { PopoverComponent } from './popover.component';

const meta = {
  title: 'Layout & Overlays/Tooltip & Popover/Popover',
  component: PopoverComponent,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right']
    }
  }
};

export default meta;

export const Default = {
  render: (args: any) => ({
    props: args,
    template: `
      <div style="padding: 120px; text-align: center; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <ngx-popover [title]="title" [position]="position">
          <button popoverTrigger style="padding: 10px 20px; border: none; border-radius: 8px; background: #4f46e5; color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Click to Toggle Popover
          </button>
          <div popoverBody style="width: 240px; font-family: system-ui, sans-serif;">
            <p style="margin: 0 0 8px 0; color: #475569; font-size: 13px; line-height: 1.4; text-align: left;">This popover contains styled details, links, and text formatting.</p>
            <div style="display: flex; gap: 8px; justify-content: flex-start; margin-top: 12px;">
              <a href="#" style="color: #4f46e5; font-size: 12px; font-weight: 600; text-decoration: none;">View Docs</a>
              <span style="color: #cbd5e1;">|</span>
              <a href="#" style="color: #64748b; font-size: 12px; text-decoration: none;">Dismiss</a>
            </div>
          </div>
        </ngx-popover>
      </div>
    `
  }),
  args: {
    title: 'Popover Details',
    position: 'bottom'
  }
};

export const PlacementTop = {
  ...Default,
  args: {
    title: 'Popover Top',
    position: 'top'
  }
};

export const PlacementRight = {
  ...Default,
  args: {
    title: 'Popover Right',
    position: 'right'
  }
};
