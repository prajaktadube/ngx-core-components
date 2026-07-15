import { TagInputComponent } from './tag-input.component';

const meta = {
  title: 'Advanced Inputs/Tag Input/TagInput',
  component: TagInputComponent,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    tags: null,
    placeholder: 'Add tag...',
    maxTags: 20,
    allowDuplicates: false,
    disabled: false,
    theme: 'light',
  },
};
