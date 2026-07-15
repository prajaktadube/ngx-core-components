import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Feedback/Feedback & Progress/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
    },
    dot: { control: 'boolean' },
    positioned: { control: 'boolean' },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
    ariaLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Default: Story = {
  args: {
    content: 'New',
    variant: 'primary',
    dot: false,
    positioned: false,
    position: 'top-right',
    ariaLabel: '',
  },
};

export const SuccessBadge: Story = {
  args: {
    ...Default.args,
    content: 'Active',
    variant: 'success',
  },
};

export const DangerCount: Story = {
  args: {
    ...Default.args,
    content: 5,
    variant: 'danger',
  },
};

export const WarningBadge: Story = {
  args: {
    ...Default.args,
    content: 'Pending',
    variant: 'warning',
  },
};

export const InfoBadge: Story = {
  args: {
    ...Default.args,
    content: 'Beta',
    variant: 'info',
  },
};

export const DarkBadge: Story = {
  args: {
    ...Default.args,
    content: 'Pro',
    variant: 'dark',
  },
};

export const LightBadge: Story = {
  args: {
    ...Default.args,
    content: 'Free',
    variant: 'light',
  },
};

export const DotIndicator: Story = {
  args: {
    ...Default.args,
    dot: true,
    variant: 'success',
    content: '',
  },
};

export const DotDanger: Story = {
  args: {
    ...Default.args,
    dot: true,
    variant: 'danger',
    content: '',
  },
};

export const PositionedTopRight: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-badge [content]="content" [variant]="variant" [dot]="dot" [positioned]="positioned" [position]="position">
        <div style="width: 48px; height: 48px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">📦</div>
      </ngx-badge>
    `,
  }),
  args: {
    content: 3,
    variant: 'danger',
    dot: false,
    positioned: true,
    position: 'top-right',
    ariaLabel: '3 notifications',
  },
};

export const PositionedDotOverlay: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-badge [content]="content" [variant]="variant" [dot]="dot" [positioned]="positioned" [position]="position">
        <div style="width: 40px; height: 40px; background: #c7d2fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">👤</div>
      </ngx-badge>
    `,
  }),
  args: {
    content: '',
    variant: 'success',
    dot: true,
    positioned: true,
    position: 'bottom-right',
    ariaLabel: 'Online',
  },
};

export const LargeCount: Story = {
  args: {
    ...Default.args,
    content: 99,
    variant: 'danger',
  },
};
