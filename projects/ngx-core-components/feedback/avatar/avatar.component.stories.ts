import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Feedback/Avatars/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    src: { control: 'text' },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    shape: {
      control: 'select',
      options: ['circle', 'square', 'rounded'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away', 'none'],
    },
    badge: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
    src: '',
    size: 'md',
    shape: 'circle',
    status: 'none',
    badge: null,
    color: '',
  },
};

export const WithImage: Story = {
  args: {
    ...Default.args,
    name: 'Alex Morgan',
    src: 'https://i.pravatar.cc/150?u=alex',
  },
};

export const OnlineStatus: Story = {
  args: {
    ...Default.args,
    name: 'Sarah Connor',
    status: 'online',
  },
};

export const BusyStatus: Story = {
  args: {
    ...Default.args,
    name: 'John Smith',
    status: 'busy',
  },
};

export const AwayStatus: Story = {
  args: {
    ...Default.args,
    name: 'Mike Chen',
    status: 'away',
  },
};

export const OfflineStatus: Story = {
  args: {
    ...Default.args,
    name: 'Lisa Park',
    status: 'offline',
  },
};

export const WithBadge: Story = {
  args: {
    ...Default.args,
    name: 'Tom Wilson',
    badge: '3',
    size: 'lg',
  },
};

export const ExtraSmall: Story = {
  args: {
    ...Default.args,
    name: 'Anna Bell',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    name: 'Bob Ross',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    name: 'Diana Prince',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    ...Default.args,
    name: 'Clark Kent',
    size: 'xl',
  },
};

export const SquareShape: Story = {
  args: {
    ...Default.args,
    name: 'Bruce Wayne',
    shape: 'square',
    size: 'lg',
  },
};

export const RoundedShape: Story = {
  args: {
    ...Default.args,
    name: 'Peter Parker',
    shape: 'rounded',
    size: 'lg',
  },
};

export const CustomColor: Story = {
  args: {
    ...Default.args,
    name: 'Custom User',
    color: '#e74c3c',
    size: 'lg',
  },
};

export const ImageWithStatus: Story = {
  args: {
    ...Default.args,
    name: 'Natasha Romanoff',
    src: 'https://i.pravatar.cc/150?u=natasha',
    status: 'online',
    size: 'lg',
  },
};

export const ImageWithBadge: Story = {
  args: {
    ...Default.args,
    name: 'Tony Stark',
    src: 'https://i.pravatar.cc/150?u=tony',
    badge: '9+',
    size: 'xl',
  },
};
