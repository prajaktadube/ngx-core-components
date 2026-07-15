import { ListViewComponent } from './list-view.component';

const meta = {
  title: 'Data Presentation/Tree & List Views/ListView',
  component: ListViewComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    items: ['Item 1', 'Item 2', 'Item 3'],
    selectable: true,
    multiselect: false,
    loading: false,
    labelField: 'label',
    pageSize: 0,
  },
};
