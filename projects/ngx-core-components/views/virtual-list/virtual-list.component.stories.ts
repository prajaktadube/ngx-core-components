import { VirtualListComponent } from './virtual-list.component';

const meta = {
  title: 'Advanced Inputs/Virtual List/VirtualList',
  component: VirtualListComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    items: [{ id: '1', label: 'Item 1', value: '1' }, { id: '2', label: 'Item 2', value: '2' }],
    itemHeight: 48,
    containerHeight: 400,
    overscan: 5,
    striped: false,
    showCount: true,
    emptyText: 'No items to display',
    labelKey: 'label',
    renderTemplate: null,
  },
};
