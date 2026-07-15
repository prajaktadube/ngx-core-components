import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonGroupComponent } from './button-group.component';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<ButtonGroupComponent> = {
  title: 'Inputs & Actions/Buttons & Chips/ButtonGroup',
  component: ButtonGroupComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonGroupComponent, ButtonComponent],
    }),
  ],
  argTypes: {
    vertical: { control: 'boolean', description: 'Sets vertical column layout orientation' },
    ariaLabel: { control: 'text', description: 'Accessibility label for screen readers' }
  },
};

export default meta;
type Story = StoryObj<ButtonGroupComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-button-group [vertical]="vertical" [ariaLabel]="ariaLabel">
        <ngx-button variant="secondary">Left</ngx-button>
        <ngx-button variant="secondary">Middle</ngx-button>
        <ngx-button variant="secondary">Right</ngx-button>
      </ngx-button-group>
    `
  }),
  args: {
    vertical: false,
    ariaLabel: 'Basic button group'
  }
};

export const VerticalIcons: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-button-group [vertical]="vertical" [ariaLabel]="ariaLabel">
        <ngx-button variant="primary" shape="square" ariaLabel="Align top">🔼</ngx-button>
        <ngx-button variant="primary" shape="square" ariaLabel="Align center">⏺️</ngx-button>
        <ngx-button variant="primary" shape="square" ariaLabel="Align bottom">🔽</ngx-button>
      </ngx-button-group>
    `
  }),
  args: {
    vertical: true,
    ariaLabel: 'Vertical control buttons'
  }
};

export const ColorThemedActions: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-button-group [vertical]="vertical" [ariaLabel]="ariaLabel">
        <ngx-button variant="success">Accept</ngx-button>
        <ngx-button variant="warning">Hold</ngx-button>
        <ngx-button variant="danger">Reject</ngx-button>
      </ngx-button-group>
    `
  }),
  args: {
    vertical: false,
    ariaLabel: 'Workflow action button group'
  }
};
