import { PivotGridComponent } from './pivot-grid.component';

const meta = {
  title: 'Data Presentation/Data Grid Enterprise/PivotGrid',
  component: PivotGridComponent,
  tags: ['autodocs'],

};

export default meta;

export const Default = {
  args: {
    data: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }],
    rows: null,
    columns: null,
    values: null,
    emptyValue: '-',
  },
};
