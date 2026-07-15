import { KeyValueListComponent } from './key-value-list.component';

const meta = {
  title: 'Data Presentation/Key-Value List/KeyValueList',
  component: KeyValueListComponent,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ["horizontal","vertical"],
    },
    theme: {
      control: 'select',
      options: ["light","dark"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    items: [{ id: '1', label: 'Item 1', value: '1' }, { id: '2', label: 'Item 2', value: '2' }],
    layout: 'horizontal',
    striped: false,
    searchable: false,
    theme: 'light',
    id: 'ngx-kv-list-' + Math.random().toString(36).substring(2, 9),
  },
};
