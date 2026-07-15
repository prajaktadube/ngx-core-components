import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TabStripComponent, TabComponent } from './tab-strip.component';

const meta: Meta<TabStripComponent> = {
  title: 'Layout & Overlays/Layout & Containers/TabStrip',
  component: TabStripComponent,
  decorators: [
    moduleMetadata({
      imports: [TabStripComponent, TabComponent],
    }),
  ],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<TabStripComponent>;

export const Default: Story = {
  args: {
    position: 'top',
  },
  render: (args) => ({
    props: args,
    template: `
      <ngx-tab-strip [position]="position">
        <ngx-tab title="General Settings" icon="⚙️">
          <div style="padding: 12px; font-family: sans-serif;">
            <h3>General Settings</h3>
            <p>Configure your system parameters and application configurations here.</p>
          </div>
        </ngx-tab>
        <ngx-tab title="Notifications" badge="3" icon="🔔">
          <div style="padding: 12px; font-family: sans-serif;">
            <h3>Notification Preferences</h3>
            <p>Select how and when you want to receive alerts and notifications.</p>
          </div>
        </ngx-tab>
        <ngx-tab title="Billing (Disabled)" [disabled]="true" icon="💳">
          <div style="padding: 12px; font-family: sans-serif;">
            <h3>Billing Information</h3>
            <p>Manage your invoices and payment methods.</p>
          </div>
        </ngx-tab>
        <ngx-tab title="Security" icon="🔒">
          <div style="padding: 12px; font-family: sans-serif;">
            <h3>Security Settings</h3>
            <p>Change your password, enable two-factor authentication, or check login history.</p>
          </div>
        </ngx-tab>
      </ngx-tab-strip>
    `,
  }),
};

export const BottomPosition: Story = {
  args: {
    position: 'bottom',
  },
  render: Default.render,
};

export const LeftPosition: Story = {
  args: {
    position: 'left',
  },
  render: Default.render,
};
